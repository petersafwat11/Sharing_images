'use client';

import NextImage, { type ImageProps } from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { blurHashToDataUrl } from '@/lib/utils/blurhash';
import { cn } from '@/lib/utils/cn';

interface BlurImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  /**
   * Optional blurhash string. Decoded client-side into a base64 data
   * URL and passed to next/image as `blurDataURL` so the placeholder
   * renders before hydration completes. When absent, falls back to a
   * solid bg-subtle tint (still no CLS).
   */
  blurHash?: string | null;
}

/**
 * next/image wrapper that fades the real image in once loaded and
 * shows a decoded blurhash placeholder underneath. Decoding is
 * lazy + memoized — see lib/utils/blurhash.ts.
 */
export function BlurImage({
  blurHash,
  className,
  onLoad,
  ...props
}: BlurImageProps): React.ReactElement {
  const [loaded, setLoaded] = useState(false);
  const [blurDataURL, setBlurDataURL] = useState<string | null>(null);

  const memoHash = useMemo(() => blurHash, [blurHash]);

  useEffect(() => {
    if (!memoHash) return;
    // Decoding requires `document` so it can only happen after mount.
    const url = blurHashToDataUrl(memoHash);
    if (url) setBlurDataURL(url);
  }, [memoHash]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg-subtle">
      {blurDataURL && !loaded && (
        // Plain <img> for the placeholder so we control opacity precisely
        // without next/image complaining about external base64 sources.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blurDataURL}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl"
        />
      )}
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
