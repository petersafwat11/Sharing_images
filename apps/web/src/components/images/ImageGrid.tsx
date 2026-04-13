'use client';

import { useEffect, useRef } from 'react';
import type { Image } from '@picflow/shared';
import { ImageCard } from './ImageCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageGridProps {
  images: ReadonlyArray<Image>;
  isFetchingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

/**
 * Masonry-ish grid for the dashboard. Uses IntersectionObserver to
 * trigger `onLoadMore` per §7 UX behavior. Responsive column counts:
 * 4 on desktop, 3 on md, 2 on mobile.
 */
export function ImageGrid({
  images,
  isFetchingMore,
  hasMore,
  onLoadMore,
}: ImageGridProps): React.ReactElement {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !isFetchingMore) {
            onLoadMore();
          }
        }
      },
      { rootMargin: '300px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, onLoadMore]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <ImageCard key={img.id} image={img} />
        ))}
        {isFetchingMore &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`sk-${i}`} className="aspect-square rounded-xl" />
          ))}
      </div>

      {hasMore && <div ref={sentinelRef} className="h-6" aria-hidden />}
    </div>
  );
}
