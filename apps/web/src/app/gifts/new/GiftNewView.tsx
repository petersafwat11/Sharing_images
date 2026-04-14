'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Gift, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageContainer } from '@/components/layout/PageContainer';
import { createGift } from '@/lib/api/gifts';
import toast from 'react-hot-toast';

export function GiftNewView(): React.ReactElement {
  const router = useRouter();
  const params = useSearchParams();
  const shareSlug = params.get('slug') ?? '';

  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = recipientName.trim().length > 0 && shareSlug.length > 0 && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const { id } = await createGift({
        portraitShareSlug: shareSlug,
        recipientName: recipientName.trim(),
        message: message.trim() || undefined,
      });
      router.push(`/gifts/${id}?created=1`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create gift link');
      setIsSubmitting(false);
    }
  };

  if (!shareSlug) {
    return (
      <PageContainer className="py-10 sm:py-16">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-body text-text-secondary">
            No portrait selected. Go back and generate one first.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle">
            <Gift className="h-6 w-6 text-accent" />
          </div>
          <h1 className="font-display text-page-title font-semibold tracking-tight text-text-primary">
            Send as a gift
          </h1>
          <p className="mt-2 text-body text-text-secondary">
            Create a gift link for someone special. They can view and download the portraits without
            an account.
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="recipient">Recipient&apos;s name</Label>
            <Input
              id="recipient"
              placeholder="e.g. Emma"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">
              Personal message{' '}
              <span className="text-text-tertiary">(optional)</span>
            </Label>
            <textarea
              id="message"
              placeholder="Add a heartfelt note…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full resize-none rounded-md border border-border-default bg-bg-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-border-focus"
            />
            <p className="text-right text-[11px] text-text-tertiary">
              {message.length}/500
            </p>
          </div>

          <Button type="submit" disabled={!canSubmit} className="h-10 w-full gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Creating gift…
              </>
            ) : (
              <>
                <Gift className="h-4 w-4" aria-hidden />
                Create gift link
              </>
            )}
          </Button>
        </form>
      </div>
    </PageContainer>
  );
}
