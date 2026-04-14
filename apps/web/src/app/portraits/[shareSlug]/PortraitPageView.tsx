'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gift, Sparkles, Download, Share2, ToggleLeft, ToggleRight } from 'lucide-react';
import { usePortraitStatus } from '@/lib/hooks/usePortraitStatus';
import { GeneratingScreen } from '@/components/portrait/GeneratingScreen';
import { PortraitResultsGrid } from '@/components/portrait/PortraitResultsGrid';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SocialShareButtons } from '@/components/images/SocialShareButtons';
import { getTheme } from '@picflow/shared';
import { config } from '@/lib/config';
import { apiClient } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface PortraitPageViewProps {
  shareSlug: string;
}

export function PortraitPageView({ shareSlug }: PortraitPageViewProps): React.ReactElement {
  const { data, isLoading } = usePortraitStatus(shareSlug);
  const [isPublic, setIsPublic] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const shareUrl = `${config.appUrl}/portraits/${shareSlug}`;
  const theme = data?.themeSlug ? getTheme(data.themeSlug) : null;

  const handleTogglePublic = async (): Promise<void> => {
    setIsTogglingPublic(true);
    const next = !isPublic;
    try {
      await apiClient.patch(`/gallery/${shareSlug}`, { isPublic: next });
      setIsPublic(next);
      toast.success(next ? 'Added to public gallery' : 'Removed from gallery');
    } catch {
      toast.error('Failed to update gallery setting');
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const handleDownloadAll = async (): Promise<void> => {
    if (!data?.results.length) return;
    setDownloadingAll(true);
    try {
      await Promise.all(
        data.results.map(async (r, i) => {
          const res = await fetch(r.url);
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `portrait-${i + 1}.webp`;
          a.click();
          URL.revokeObjectURL(url);
          // Small delay so browser handles multiple downloads
          await new Promise((resolve) => setTimeout(resolve, 150));
        }),
      );
    } finally {
      setDownloadingAll(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer className="py-10 sm:py-16">
        <GeneratingScreen startedAt={new Date()} />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer className="py-10 sm:py-16">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-body text-text-secondary">Portrait not found or has expired.</p>
          <Button asChild>
            <Link href="/create">Create new portraits</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isDone = data.status === 'DONE';
  const isFailed = data.status === 'FAILED';
  const isGenerating = data.status === 'PENDING' || data.status === 'PROCESSING';

  if (isFailed) {
    return (
      <PageContainer className="py-10 sm:py-16">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-body font-medium text-error">Generation failed</p>
          <p className="text-caption text-text-secondary">
            Your credit has been refunded. Please try again with a clearer photo.
          </p>
          <Button asChild>
            <Link href="/create">Try again</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        {isGenerating ? (
          <GeneratingScreen startedAt={new Date(data.createdAt)} />
        ) : isDone && data.results.length > 0 ? (
          <>
            {/* Header */}
            <div className="mb-6 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-page-title font-semibold tracking-tight text-text-primary">
                  Your portraits
                </h1>
                {theme && (
                  <Badge variant="default" className="text-caption">
                    {theme.name}
                  </Badge>
                )}
              </div>
              <p className="text-body text-text-secondary">
                {data.results.length} variants generated. Hover any portrait to download.
              </p>
            </div>

            {/* Results grid */}
            <PortraitResultsGrid results={data.results} />

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                className="gap-2"
                onClick={() => void handleDownloadAll()}
                disabled={downloadingAll}
              >
                <Download className="h-4 w-4" aria-hidden />
                {downloadingAll ? 'Downloading…' : 'Download all'}
              </Button>

              <Button variant="secondary" className="gap-2" asChild>
                <Link href={`/gifts/new?slug=${shareSlug}`}>
                  <Gift className="h-4 w-4" aria-hidden />
                  Send as gift
                </Link>
              </Button>

              <Button variant="secondary" className="gap-2" asChild>
                <Link href="/create">
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Try another theme
                </Link>
              </Button>
            </div>

            {/* Gallery opt-in */}
            <div className="mt-6 flex items-center justify-between rounded-xl border border-border-default bg-bg-surface p-4">
              <div>
                <p className="text-sm font-medium text-text-primary">Add to public gallery</p>
                <p className="mt-0.5 text-caption text-text-secondary">
                  Share your portrait to inspire others. You can remove it any time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleTogglePublic()}
                disabled={isTogglingPublic}
                className="ml-4 shrink-0 text-text-tertiary transition-colors hover:text-text-primary disabled:opacity-50"
                aria-label={isPublic ? 'Remove from gallery' : 'Add to gallery'}
              >
                {isPublic ? (
                  <ToggleRight className="h-8 w-8 text-accent" />
                ) : (
                  <ToggleLeft className="h-8 w-8" />
                )}
              </button>
            </div>

            {/* Share */}
            <div className="mt-6 rounded-xl border border-border-default bg-bg-surface p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-text-primary">
                <Share2 className="h-4 w-4 text-accent" aria-hidden />
                Share this portrait
              </div>
              <SocialShareButtons url={shareUrl} title="Check out these AI portraits!" compact />
            </div>
          </>
        ) : (
          // Generating state (fallback)
          <GeneratingScreen startedAt={new Date(data.createdAt)} />
        )}
      </div>
    </PageContainer>
  );
}
