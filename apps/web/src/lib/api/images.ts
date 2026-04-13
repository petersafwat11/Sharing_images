import type {
  Image,
  ImageListQuery,
  ImageListResponse,
} from '@picflow/shared';
import { apiClient, unwrap } from './client';

export async function getImageBySlug(slug: string): Promise<Image> {
  const res = await apiClient.get<{ data: Image }>(`/i/${slug}`);
  return unwrap(res.data);
}

export async function listMyImages(
  query: Partial<ImageListQuery> = {},
): Promise<ImageListResponse> {
  const res = await apiClient.get<{ data: ImageListResponse }>('/images', {
    params: {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 24,
      sort: query.sort ?? 'newest',
    },
  });
  return unwrap(res.data);
}

export async function deleteImage(id: string): Promise<void> {
  await apiClient.delete(`/images/${id}`);
}
