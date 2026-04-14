'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { THEMES } from '@picflow/shared';
import { BlurImage } from '@/components/common/BlurImage';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getGallery } from '@/lib/api/gallery';

const CATEGORIES = [
  'all',
  'classic',
  'nature',
  'fantasy',
  'seasonal',
  'artistic',
  'adventure',
  'cultural',
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All',
  classic: 'Classic',
  nature: 'Nature',
  fantasy: 'Fantasy',
  seasonal: 'Seasonal',
  artistic: 'Artistic',
  adventure: 'Adventure',
  cultural: 'Cultural',
};

function getCategoryThemeSlugs(category: Category): string[] {
  if (category === 'all') return [];
  return THEMES.filter((t) => t.category === category).map((t) => t.slug);
}

export function GalleryView(): React.ReactElement {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  // For category filter we pick one representative theme slug per category
  // and pass it to the API. The API filters by themeSlug.
  // For "all" we pass no filter.
  const themeSlugs = getCategoryThemeSlugs(activeCategory);
  const filterSlug = activeCategory === 'all' ? undefined : themeSlugs[0];

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['gallery', activeCategory],
    queryFn: ({ pageParam }) =>
      getGallery({ themeSlug: filterSlug, cursor: pageParam as string | undefined }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });

  const portraits = data?.pages.flatMap((p) => p.portraits) ?? [];

  return (
    <PageContainer className="py-10 sm:py-16">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-page-title font-semibold tracking-tight text-text-primary">
          Portrait Gallery
        </h1>
        <p className="text-body text-text-secondary">
          Community portraits shared with permission. Click any style to create your own.
        </p>
      </div>

      {/* Category tabs */}
      <div className="mb-6 overflow-x-auto">
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as Category)}>
          <TabsList className="inline-flex w-max">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="columns-2 gap-3 sm:columns-3 md:columns-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="mb-3 break-inside-avoid">
              <Skeleton
                className="w-full rounded-xl"
                style={{ height: `${Math.floor(Math.random() * 100) + 200}px` }}
              />
            </div>
          ))}
        </div>
      ) : portraits.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
          <p className="text-body text-text-secondary">
            No public portraits in this category yet.
          </p>
          <p className="text-caption text-text-tertiary">Be the first to create one.</p>
        </div>
      ) : (
        <>
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4">
            {portraits.map((portrait) => (
              <Link
                key={portrait.shareSlug}
                href={`/portraits/${portrait.shareSlug}`}
                className="group mb-3 block break-inside-avoid overflow-hidden rounded-xl border border-border-default transition-colors duration-150 hover:border-border-strong"
              >
                <BlurImage
                  src={portrait.thumbnailUrl}
                  alt="Community portrait"
                  blurHash={portrait.blurHash}
                  width={portrait.width ?? 400}
                  height={portrait.height ?? 600}
                  className="w-full object-cover"
                />
              </Link>
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="secondary"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}

      {/* CTA */}
      <div className="mt-12 flex flex-col items-center gap-3 text-center">
        <p className="text-body text-text-secondary">
          Create your own AI baby portraits.
        </p>
        <Button asChild className="gap-2">
          <Link href="/create">
            <Sparkles className="h-4 w-4" aria-hidden />
            Start creating
          </Link>
        </Button>
      </div>
    </PageContainer>
  );
}
