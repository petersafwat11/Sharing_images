'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HardDrive, ImagePlus } from 'lucide-react';
import type { PublicUser, SortKey } from '@picflow/shared';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ImageGrid } from '@/components/images/ImageGrid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentUser } from '@/lib/api/auth';
import { ApiError, getAuthToken } from '@/lib/api/client';
import { useMyImagesInfinite } from '@/lib/hooks/useImageQuery';
import { formatBytes } from '@/lib/utils/format';
import { DashboardSortPicker } from './DashboardSortPicker';

/**
 * Client-side dashboard container. Redirects to /auth/login when
 * unauthenticated. Wires the infinite query to the image grid and
 * renders the storage-used counter in the header per §7.
 */
export function DashboardView(): React.ReactElement {
  const router = useRouter();
  const [sort, setSort] = useState<SortKey>('newest');
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    setHasToken(!!token);
    if (!token) router.replace('/auth/login');
  }, [router]);

  const { data: user } = useQuery<PublicUser, ApiError>({
    queryKey: ['users', 'me'],
    queryFn: getCurrentUser,
    enabled: hasToken === true,
    retry: false,
  });

  const query = useMyImagesInfinite(sort);
  const images = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  );
  const total = query.data?.pages[0]?.total ?? 0;

  if (hasToken === null) {
    return (
      <PageContainer>
        <LoadingSpinner label="Checking session" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-accent">
            Dashboard
          </p>
          <h1 className="mt-1 font-display text-page-title text-text-primary">
            Your uploads
          </h1>
          <p className="mt-1 text-body text-text-secondary">
            {user ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-text-secondary">
                  <HardDrive className="h-3.5 w-3.5 text-text-tertiary" aria-hidden />
                  {formatBytes(user.storageUsed)} used
                </span>
                <span className="mx-2 text-text-tertiary">·</span>
                {total} {total === 1 ? 'image' : 'images'}
              </>
            ) : (
              <Skeleton className="h-4 w-40" />
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DashboardSortPicker sort={sort} onChange={setSort} />
          <Button asChild variant="primary" size="sm">
            <Link href="/">
              <ImagePlus className="h-4 w-4" aria-hidden />
              New upload
            </Link>
          </Button>
        </div>
      </header>

      {query.isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <EmptyState
          icon={ImagePlus}
          title="No uploads yet"
          description="Drop an image on the home page to get your first shareable link."
          action={
            <Button asChild variant="primary" size="sm">
              <Link href="/">Upload now</Link>
            </Button>
          }
        />
      ) : (
        <ImageGrid
          images={images}
          hasMore={!!query.hasNextPage}
          isFetchingMore={query.isFetchingNextPage}
          onLoadMore={() => {
            void query.fetchNextPage();
          }}
        />
      )}
    </PageContainer>
  );
}
