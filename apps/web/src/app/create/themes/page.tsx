'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { ThemeGrid } from '@/components/portrait/ThemeGrid';
import { OutOfCreditsModal } from '@/components/portrait/OutOfCreditsModal';
import { usePortraitStore } from '@/lib/store/portrait.store';
import { startPortrait } from '@/lib/api/portraits';
import { ApiError } from '@/lib/api/client';
import { getTheme } from '@picflow/shared';
import toast from 'react-hot-toast';

export default function ThemesPage(): React.ReactElement {
  const router = useRouter();
  const { inputKeys, email, selectedThemeSlug, selectTheme, reset } = usePortraitStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOutOfCredits, setShowOutOfCredits] = useState(false);

  // Guard: if store is empty (direct navigation or refresh), send back
  useEffect(() => {
    if (inputKeys.length === 0) {
      router.replace('/create');
    }
  }, [inputKeys.length, router]);

  const selectedTheme = selectedThemeSlug ? getTheme(selectedThemeSlug) : null;
  const canGenerate = !!selectedThemeSlug && !isGenerating;

  const handleGenerate = async (): Promise<void> => {
    if (!selectedThemeSlug) return;
    setIsGenerating(true);

    try {
      const { shareSlug } = await startPortrait({
        themeSlug: selectedThemeSlug,
        inputKeys,
        email: email || undefined,
      });

      reset();
      router.push(`/portraits/${shareSlug}`);
    } catch (err) {
      setIsGenerating(false);
      if (err instanceof ApiError && err.message === 'Insufficient credits') {
        setShowOutOfCredits(true);
        return;
      }
      const message = err instanceof Error ? err.message : 'Failed to start generation';
      toast.error(message);
    }
  };

  if (inputKeys.length === 0) return <div />;

  return (
    <>
    <OutOfCreditsModal open={showOutOfCredits} onClose={() => setShowOutOfCredits(false)} />
    <PageContainer className="py-10 sm:py-16">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-page-title font-semibold tracking-tight text-text-primary">
            Pick a theme
          </h1>
          <p className="text-body text-text-secondary">
            Choose an art style for your portraits.
            {selectedTheme && (
              <span className="ml-1 text-text-primary font-medium">
                &ldquo;{selectedTheme.name}&rdquo; selected.
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="h-10 gap-2 px-6"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Starting…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden />
                Generate portraits
              </>
            )}
          </Button>
          <p className="text-caption text-text-tertiary">
            Uses 1 credit · ~2 min
          </p>
        </div>
      </div>

      {/* Theme grid with category tabs */}
      <ThemeGrid
        selectedSlug={selectedThemeSlug}
        onSelect={selectTheme}
      />

      {/* Sticky bottom CTA on mobile */}
      {selectedThemeSlug && (
        <div className="fixed inset-x-0 bottom-0 border-t border-border-default bg-bg-base/95 p-4 backdrop-blur-sm sm:hidden">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="h-10 w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Starting…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden />
                Generate with &ldquo;{selectedTheme?.name}&rdquo;
              </>
            )}
          </Button>
        </div>
      )}
    </PageContainer>
    </>
  );
}
