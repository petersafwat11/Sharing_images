'use client';

import NextImage, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface BlurImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  /**
   * A blurhash string. Decoded client-side into a base64 data URL.
   * Phase 4 wires this through; full blurhash decoding is added in
   * Phase 5 polish — for now we fall back to a solid low-contrast tint
   * while the real image loads, which keeps CLS at zero without
   * shipping the blurhash decoder upfront.
   */
  blurHash?: string | null;
}

/**
 * Thin wrapper around next/image that fades the image in once loaded
 * and shows a subtle surface-colored placeholder underneath. Blurhash
 * decoding is deferred to Phase 5 (see CLAUDE.md §12).
 */
export function BlurImage({
  blurHash: _blurHash,
  className,
  onLoad,
  ...props
}: BlurImageProps): React.ReactElement {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-full w-full overflow-hidden bg-bg-subtle">
      <NextImage
        {...props}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-300 ease-out',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
      />
    </div>
  );
}
