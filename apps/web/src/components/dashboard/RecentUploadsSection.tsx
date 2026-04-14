'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/api/auth';
import { ApiError, getAuthToken } from '@/lib/api/client';
import { ImageCard } from '@/components/images/ImageCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyImagesInfinite } from '@/lib/hooks/useImageQuery';
import type { PublicUser } from '@picflow/shared';

const RECENT_LIMIT = 4;

/**
 * Renders the four most recent uploads for an authenticated user
 * directly under the upload zone — §6.1 "home — upload zone, hero
 * text, recent uploads if authed". Renders nothing for anonymous
 * visitors so the home stays minimal.
 */
export function RecentUploadsSection(): React.ReactElement | null {
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    setHasToken(!!getAuthToken());
  }, []);

  const userQuery = useQuery<PublicUser, ApiError>({
    queryKey: ['users', 'me'],
    queryFn: getCurrentUser,
    enabled: hasToken === true,
    retry: false,
  });

  const imagesQuery = useMyImagesInfinite('newest');
  const items = imagesQuery.data?.pages[0]?.items.slice(0, RECENT_LIMIT) ?? [];

  if (hasToken !== true || userQuery.isError) return null;

  return (
    <section className="flex flex-col gap-3" aria-label="Recent uploads">
      <header className="flex items-center justify-between">
        <h2 className="font-display text-section text-text-primary">
          Recent uploads
        </h2>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-caption text-text-tertiary transition-colors hover:text-text-secondary"
        >
          View all
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </header>

      {imagesQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: RECENT_LIMIT }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-caption text-text-tertiary">
          Your uploads will appear here.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((img) => (
            <ImageCard key={img.id} image={img} />
          ))}
        </div>
      )}
    </section>
  );
}
