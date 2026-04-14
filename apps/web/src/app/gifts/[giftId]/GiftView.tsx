'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Gift, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { PortraitResultsGrid } from '@/components/portrait/PortraitResultsGrid';
import { useCopyToClipboard } from '@/lib/hooks/useCopyToClipboard';
import { getGift } from '@/lib/api/gifts';
import { getTheme } from '@picflow/shared';
import { config } from '@/lib/config';
import toast from 'react-hot-toast';

interface GiftViewProps {
  giftId: string;
}

export function GiftView({ giftId }: GiftViewProps): React.ReactElement {
  const searchParams = useSearchParams();
  const isJustCreated = searchParams.get('created') === '1';

  const { data: gift, isLoading, isError } = useQuery({
    queryKey: ['gift', giftId],
    queryFn: () => getGift(giftId),
  });

  const giftUrl = `${config.appUrl}/gifts/${giftId}`;
  const { copied, copy } = useCopyToClipboard(2000);

  useEffect(() => {
    if (isJustCreated && gift) {
      toast.success('Gift link created! Share it with the recipient.');
    }
  }, [isJustCreated, gift]);

  if (isLoading) {
    return (
      <PageContainer className="py-10 sm:py-16">
        <div className="mx-auto max-w-2xl space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (isError || !gift) {
    return (
      <PageContainer className="py-10 sm:py-16">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-body text-text-secondary">This gift link is invalid or has expired.</p>
          <Button asChild>
            <Link href="/create">Create your own portraits</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const theme = getTheme(gift.portrait.themeSlug);

  return (
    <PageContainer className="py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        {/* Gift header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-subtle">
            <Gift className="h-7 w-7 text-accent" />
          </div>
          <h1 className="font-display text-page-title font-semibold tracking-tight text-text-primary">
            A gift for {gift.recipientName}!
          </h1>
          {gift.message && (
            <p className="mt-3 rounded-xl border border-border-default bg-bg-surface px-5 py-4 text-body italic text-text-secondary">
              &ldquo;{gift.message}&rdquo;
            </p>
          )}
          {theme && (
            <p className="mt-2 text-caption text-text-tertiary">
              Style: {theme.name}
            </p>
          )}
        </div>

        {/* Portrait grid */}
        {gift.portrait.results.length > 0 && (
          <PortraitResultsGrid results={gift.portrait.results} />
        )}

        {/* Share gift link (shown to creator) */}
        {isJustCreated && (
          <div className="mt-6 rounded-xl border border-accent/20 bg-accent-subtle p-4">
            <p className="mb-2 text-sm font-medium text-text-primary">Share this gift link</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md bg-bg-subtle px-3 py-1.5 font-mono text-[13px] text-text-secondary">
                {giftUrl}
              </code>
              <Button
                size="sm"
                variant="secondary"
                className="shrink-0 gap-1.5"
                onClick={() => void copy(giftUrl)}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-success" aria-hidden />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                )}
                {copied ? 'Copied!' : 'Copy link'}
              </Button>
            </div>
          </div>
        )}

        {/* Viral soft CTA */}
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-body text-text-secondary">
            Love these portraits?
          </p>
          <Button asChild className="gap-2">
            <Link href="/create">
              <Sparkles className="h-4 w-4" aria-hidden />
              Create your own for free
            </Link>
          </Button>
          <p className="text-caption text-text-tertiary">
            3 free credits on signup. No subscription required.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
