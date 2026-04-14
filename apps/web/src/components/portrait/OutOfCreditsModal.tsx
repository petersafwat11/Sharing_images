'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import { CREDIT_PACKS } from '@picflow/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { purchaseCredits } from '@/lib/api/credits';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

interface OutOfCreditsModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Shown when `POST /portraits/start` returns "Insufficient credits".
 * Offers quick credit pack purchase shortcuts and a link to /pricing.
 */
export function OutOfCreditsModal({ open, onClose }: OutOfCreditsModalProps): React.ReactElement {
  const router = useRouter();
  const [buyingPack, setBuyingPack] = useState<string | null>(null);

  const handleBuy = async (packId: (typeof CREDIT_PACKS)[number]['id']): Promise<void> => {
    setBuyingPack(packId);
    try {
      const { url } = await purchaseCredits(packId);
      window.location.href = url;
    } catch {
      toast.error('Failed to start checkout — please try again');
      setBuyingPack(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle">
            <Sparkles className="h-5 w-5 text-accent" aria-hidden />
          </div>
          <DialogTitle>You&apos;re out of credits</DialogTitle>
          <DialogDescription>
            Pick up a credit pack to keep generating portraits. Credits never expire.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-1">
          {CREDIT_PACKS.map((pack) => {
            const isPopular = 'badge' in pack;
            const isBuying = buyingPack === pack.id;
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => void handleBuy(pack.id)}
                disabled={!!buyingPack}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3 text-left transition-colors duration-150 disabled:opacity-60',
                  isPopular
                    ? 'border-accent-border bg-accent-subtle hover:bg-accent/20'
                    : 'border-border-default bg-bg-surface hover:border-border-strong',
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{pack.label}</span>
                    {isPopular && (
                      <span className="rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Best value
                      </span>
                    )}
                  </div>
                  <span className="text-caption text-text-tertiary">{pack.credits} credits · {pack.perGenDisplay}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-text-primary">
                    {pack.priceDisplay}
                  </span>
                  {isBuying && <Loader2 className="h-4 w-4 animate-spin text-text-tertiary" />}
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { onClose(); router.push('/pricing'); }}
          >
            See all plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
