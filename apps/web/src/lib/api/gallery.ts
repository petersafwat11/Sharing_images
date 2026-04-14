import { apiClient, unwrap } from './client';

export interface GalleryPortrait {
  shareSlug: string;
  themeSlug: string;
  createdAt: string;
  thumbnailUrl: string;
  blurHash: string | null;
  width: number | null;
  height: number | null;
}

export interface GalleryResponse {
  portraits: GalleryPortrait[];
  nextCursor: string | null;
}

export async function getGallery(opts: {
  themeSlug?: string;
  cursor?: string;
  take?: number;
}): Promise<GalleryResponse> {
  const params = new URLSearchParams();
  if (opts.themeSlug) params.set('themeSlug', opts.themeSlug);
  if (opts.cursor) params.set('cursor', opts.cursor);
  if (opts.take) params.set('take', String(opts.take));
  const res = await apiClient.get<{ data: GalleryResponse }>(`/gallery?${params.toString()}`);
  return unwrap(res.data);
}
