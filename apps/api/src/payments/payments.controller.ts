import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { CheckoutDto } from './dto/checkout.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly payments: PaymentsService) {}

  /** POST /api/payments/checkout — creates a Stripe Checkout Session */
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async createCheckout(
    @Body() dto: CheckoutDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ url: string }> {
    return this.payments.createCheckoutSession(user.id, dto.pack);
  }

  /**
   * POST /api/payments/webhook — Stripe calls this after successful payment.
   * Uses raw body (via NestFactory rawBody:true) for HMAC signature verification.
   */
  @Post('webhook')
  @HttpCode(200)
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ): Promise<{ received: boolean }> {
    const payload = req.rawBody;
    if (!payload) throw new BadRequestException('Missing raw body');
    if (!sig) throw new BadRequestException('Missing stripe-signature header');

    await this.payments.handleWebhook(payload, sig);
    return { received: true };
  }
}
