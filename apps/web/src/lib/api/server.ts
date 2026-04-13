import type { Image } from '@picflow/shared';
import { apiUrl } from '@/lib/config';

/**
 * Server-only fetchers. These run during SSR/SSG of App Router pages
 * and route handlers. They must NOT import browser-only helpers like
 * `apiClient` (which reads localStorage).
 */

export async function fetchImageBySlugServer(
  slug: string,
): Promise<Image | null> {
  const res = await fetch(apiUrl(`/i/${slug}`), {
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;
  if (!res.ok) return null;

  const body = (await res.json()) as { data: Image };
  return body.data;
}
