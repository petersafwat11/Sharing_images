'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageContainer } from '@/components/layout/PageContainer';
import { ThemeGrid } from '@/components/portrait/ThemeGrid';
import { OutOfCreditsModal } from '@/components/portrait/OutOfCreditsModal';
import { usePortraitStore } from '@/lib/store/portrait.store';
import { startPortrait } from '@/lib/api/portraits';
import { ApiError, getAuthToken } from '@/lib/api/client';
import { getTheme } from '@picflow/shared';
import toast from 'react-hot-toast';

export default function ThemesPage(): React.ReactElement {
  const router = useRouter();
  const { inputKeys, email, selectedThemeSlug, selectTheme, setEmail, reset } = usePortraitStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOutOfCredits, setShowOutOfCredits] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(!!getAuthToken());
  }, []);

  // Guard: if store was never populated (direct navigation / refresh), send back.
  // Intentionally run on mount only — do NOT add inputKeys to deps, because
  // reset() clears the store before router.push() resolves and would cause a
  // spurious redirect back to /create after a successful generation.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (inputKeys.length === 0) {
      router.replace('/create');
    }
  }, []);

  const selectedTheme = selectedThemeSlug ? getTheme(selectedThemeSlug) : null;
  const emailOk = isAuthed || email.trim().length > 0;
  const canGenerate = !!selectedThemeSlug && !isGenerating && emailOk;

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

      {/* Email gate — only for anonymous users */}
      {!isAuthed && (
        <div className="mt-8 space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text-primary"
          >
            Email address
            <span className="ml-1 text-text-tertiary font-normal">
              — we&apos;ll notify you when portraits are ready
            </span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="max-w-sm"
          />
          <p className="text-caption text-text-tertiary">
            No account needed. No spam.{' '}
            <a href="/privacy" className="underline underline-offset-2 hover:text-text-secondary">
              Privacy policy
            </a>
          </p>
        </div>
      )}

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
