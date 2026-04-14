'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageContainer } from '@/components/layout/PageContainer';
import { PortraitUploadStep } from '@/components/portrait/PortraitUploadStep';
import { usePortraitStore } from '@/lib/store/portrait.store';
import { getAuthToken } from '@/lib/api/client';

export function CreatePageInner(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPhotos, setEmail, selectTheme, email } = usePortraitStore();

  // Pre-select theme when coming from /themes?theme=slug
  useEffect(() => {
    const themeParam = searchParams.get('theme');
    if (themeParam) selectTheme(themeParam);
  }, [searchParams, selectTheme]);

  const [keys, setKeys] = useState<string[]>([]);
  const [isAuthed] = useState(() => typeof window !== 'undefined' && !!getAuthToken());

  const isReady = keys.length >= 1 && (!isAuthed ? email.trim().length > 0 : true);

  const handleContinue = (): void => {
    setPhotos(keys, []); // previews already managed locally in PortraitUploadStep
    router.push('/create/themes');
  };

  return (
    <PageContainer className="py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="font-display text-page-title font-semibold tracking-tight text-text-primary">
            Upload your photos
          </h1>
          <p className="text-body text-text-secondary">
            Add 1–5 clear photos of your baby. More photos = better likeness.
          </p>
        </div>

        {/* Upload area */}
        <PortraitUploadStep onKeysChange={setKeys} />

        {/* Email gate — only for anonymous users */}
        {!isAuthed && (
          <div className="mt-6 space-y-2">
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

        {/* CTA */}
        <div className="mt-8">
          <Button
            onClick={handleContinue}
            disabled={!isReady}
            className="h-10 gap-2 px-6"
          >
            Choose theme
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <p className="mt-2 text-caption text-text-tertiary">
            {keys.length === 0
              ? 'Upload at least one photo to continue'
              : 'Generation uses 1 credit · ~2 min'}
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
