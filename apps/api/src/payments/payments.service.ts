import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { CREDIT_PACKS, type CreditPackId } from '@picflow/shared';
import { AppConfigService } from '../config/app-config.service';
import { CreditsService } from '../credits/credits.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly appUrl: string;

  constructor(
    private readonly config: AppConfigService,
    private readonly credits: CreditsService,
  ) {
    // Empty key in dev — checkout will be skipped with a warning
    this.stripe = new Stripe(config.get('STRIPE_SECRET_KEY') || 'sk_test_placeholder', {
      apiVersion: '2025-02-24.acacia',
    });
    this.webhookSecret = config.get('STRIPE_WEBHOOK_SECRET');
    this.appUrl = config.get('NEXT_PUBLIC_APP_URL');
  }

  async createCheckoutSession(
    userId: string,
    packId: CreditPackId,
  ): Promise<{ url: string }> {
    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (!pack) throw new BadRequestException('Invalid credit pack');

    if (!this.config.get('STRIPE_SECRET_KEY')) {
      this.logger.warn('STRIPE_SECRET_KEY not set — returning placeholder URL');
      return { url: `${this.appUrl}/pricing?stripe_not_configured=1` };
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: pack.priceUsd,
            product_data: {
              name: `Picflow ${pack.label} — ${pack.credits} credits`,
              description: `${pack.perGenDisplay} · credits never expire`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        packId,
        credits: String(pack.credits),
      },
      success_url: `${this.appUrl}/dashboard?credits_added=1`,
      cancel_url: `${this.appUrl}/pricing`,
    });

    if (!session.url) throw new Error('No checkout URL returned by Stripe');
    return { url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!this.webhookSecret) {
      this.logger.error('STRIPE_WEBHOOK_SECRET not set — rejecting webhook so Stripe will retry');
      throw new BadRequestException('Stripe webhook not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    } catch (err) {
      this.logger.error(`Stripe webhook signature failed: ${String(err)}`);
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    if (event.type !== 'checkout.session.completed') return;

    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, packId, credits } = session.metadata ?? {};
    if (!userId || !credits) {
      this.logger.warn(`Webhook: missing metadata on session ${session.id}`);
      return;
    }

    // Use payment_intent as idempotency key; fall back to session ID
    const stripeId =
      typeof session.payment_intent === 'string' ? session.payment_intent : session.id;

    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    const description = `${pack?.label ?? packId} pack — ${credits} credits`;

    await this.credits.creditPurchase({ userId, delta: Number(credits), description, stripeId });
    this.logger.log(`Credited ${credits} credits to user ${userId} (payment ${stripeId})`);
  }
}
