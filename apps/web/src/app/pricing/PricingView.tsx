'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { CREDIT_PACKS, type CreditPackId } from '@picflow/shared';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PageContainer } from '@/components/layout/PageContainer';
import { purchaseCredits } from '@/lib/api/credits';
import { getAuthToken } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

// ── Comparison table ─────────────────────────────────────────────────────────

const COMPARE_ROWS = [
  { feature: 'Free themes (7 styles)', free: true, paid: true },
  { feature: 'All 30+ premium themes', free: false, paid: true },
  { feature: '4 portrait variants per generation', free: true, paid: true },
  { feature: 'Download full-resolution', free: true, paid: true },
  { feature: 'Share link', free: true, paid: true },
  { feature: 'Results kept forever', free: false, paid: true },
  { feature: 'Credits never expire', free: false, paid: true },
];

// ── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: 'Why credits instead of a subscription?',
    a: "Most people want portraits for specific moments — a newborn, a birthday, a holiday. Credits let you pay only when you create, with no monthly commitment.",
  },
  {
    q: 'Do credits expire?',
    a: 'Never. Once you buy credits they stay on your account until you use them.',
  },
  {
    q: "What's your refund policy?",
    a: 'If a generation fails for any reason, your credit is automatically refunded. For other issues, email us within 7 days of purchase and we\'ll make it right.',
  },
  {
    q: 'Are my photos used to train AI models?',
    a: 'No. Your uploaded photos are deleted immediately after generation completes. We never use your photos for training. See our Privacy Policy for details.',
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export function PricingView(): React.ReactElement {
  const [selectedPack, setSelectedPack] = useState<CreditPackId>('popular');
  const [isBuying, setIsBuying] = useState(false);
  const isAuthed = typeof window !== 'undefined' && !!getAuthToken();

  const handlePurchase = async (): Promise<void> => {
    if (!isAuthed) {
      window.location.href = `/auth/register?redirect=/pricing`;
      return;
    }
    setIsBuying(true);
    try {
      const { url } = await purchaseCredits(selectedPack);
      window.location.href = url;
    } catch {
      toast.error('Failed to start checkout — please try again');
      setIsBuying(false);
    }
  };

  const activePack = CREDIT_PACKS.find((p) => p.id === selectedPack)!;

  return (
    <PageContainer className="py-12 sm:py-20">
      <div className="mx-auto max-w-3xl">

        {/* ── Hero ── */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-subtle">
              <Sparkles className="h-6 w-6 text-accent" aria-hidden />
            </div>
          </div>
          <h1 className="font-display text-page-title font-semibold tracking-tight text-text-primary">
            Pay as you create
          </h1>
          <p className="mt-3 text-body text-text-secondary">
            One credit, four stunning portrait variants. No subscription. No surprises.
          </p>
        </div>

        <Separator className="mb-10" />

        {/* ── Credit pack selector ── */}
        <RadioGroup
          value={selectedPack}
          onValueChange={(v) => setSelectedPack(v as CreditPackId)}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {CREDIT_PACKS.map((pack) => {
            const isSelected = selectedPack === pack.id;
            const isPopular = 'badge' in pack;
            return (
              <label
                key={pack.id}
                htmlFor={`pack-${pack.id}`}
                className={cn(
                  'relative flex cursor-pointer flex-col gap-3 rounded-xl border p-5 transition-all duration-150',
                  isSelected
                    ? 'border-accent bg-accent-subtle ring-1 ring-accent/40'
                    : 'border-border-default bg-bg-surface hover:border-border-strong',
                )}
              >
                {isPopular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white whitespace-nowrap">
                    Most Popular
                  </span>
                )}

                <div className="flex items-start justify-between">
                  <RadioGroupItem value={pack.id} id={`pack-${pack.id}`} />
                  <span className="font-mono text-lg font-semibold text-text-primary">
                    {pack.priceDisplay}
                  </span>
                </div>

                <div>
                  <p className="font-medium text-text-primary">{pack.label}</p>
                  <p className="mt-0.5 text-caption text-text-secondary">
                    {pack.credits} credits
                  </p>
                  <p className="mt-0.5 text-caption text-text-tertiary">{pack.perGenDisplay}</p>
                </div>
              </label>
            );
          })}
        </RadioGroup>

        {/* ── CTA ── */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button
            onClick={() => void handlePurchase()}
            disabled={isBuying}
            className="h-11 w-full gap-2 px-8 sm:w-auto"
          >
            {isBuying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Redirecting to checkout…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden />
                Buy {activePack.credits} credits for {activePack.priceDisplay}
              </>
            )}
          </Button>
          <p className="text-caption text-text-tertiary">
            Secure checkout via Stripe · Credits never expire
          </p>
        </div>

        {/* ── Comparison table ── */}
        <div className="mt-14">
          <h2 className="mb-5 font-display text-section font-medium text-text-primary">
            What&apos;s included
          </h2>
          <div className="rounded-xl border border-border-default overflow-hidden">
            <div className="grid grid-cols-3 border-b border-border-default bg-bg-subtle px-4 py-3">
              <span className="text-caption font-medium text-text-tertiary uppercase tracking-wide col-span-1">Feature</span>
              <span className="text-caption font-medium text-text-tertiary uppercase tracking-wide text-center">Free</span>
              <span className="text-caption font-medium text-accent uppercase tracking-wide text-center">Paid</span>
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div
                key={row.feature}
                className={cn(
                  'grid grid-cols-3 px-4 py-3 items-center',
                  i < COMPARE_ROWS.length - 1 && 'border-b border-border-default',
                )}
              >
                <span className="text-sm text-text-secondary col-span-1">{row.feature}</span>
                <span className="flex justify-center">
                  {row.free
                    ? <Check className="h-4 w-4 text-success" aria-label="Included" />
                    : <span className="text-text-disabled text-lg leading-none" aria-label="Not included">—</span>
                  }
                </span>
                <span className="flex justify-center">
                  {row.paid
                    ? <Check className="h-4 w-4 text-success" aria-label="Included" />
                    : <span className="text-text-disabled text-lg leading-none" aria-label="Not included">—</span>
                  }
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-14">
          <h2 className="mb-2 font-display text-section font-medium text-text-primary">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* ── Footer CTA ── */}
        <div className="mt-14 flex flex-col items-center gap-3 text-center">
          <p className="text-body text-text-secondary">
            Not sure yet?{' '}
            <Link href="/create" className="text-accent underline-offset-2 hover:underline">
              Try a free theme first
            </Link>{' '}
            — no credit required.
          </p>
          <p className="text-caption text-text-tertiary">
            Questions?{' '}
            <a href="mailto:hello@picflow.app" className="underline-offset-2 hover:underline">
              hello@picflow.app
            </a>
          </p>
        </div>

      </div>
    </PageContainer>
  );
}
