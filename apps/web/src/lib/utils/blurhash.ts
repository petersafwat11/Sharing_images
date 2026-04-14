import { decode } from 'blurhash';

const PUNCH = 1;
const DECODE_SIZE = 32;

/**
 * Decode a blurhash string into a base64 PNG data URL suitable for
 * `next/image`'s `blurDataURL` prop. Cached per hash so repeat renders
 * (e.g., navigating between dashboard cards) are free.
 */
const cache = new Map<string, string>();

export function blurHashToDataUrl(hash: string): string | null {
  if (typeof document === 'undefined') return null;

  const cached = cache.get(hash);
  if (cached) return cached;

  let pixels: Uint8ClampedArray;
  try {
    pixels = decode(hash, DECODE_SIZE, DECODE_SIZE, PUNCH);
  } catch {
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = DECODE_SIZE;
  canvas.height = DECODE_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const imageData = ctx.createImageData(DECODE_SIZE, DECODE_SIZE);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);

  const url = canvas.toDataURL('image/png');
  cache.set(hash, url);
  return url;
}
