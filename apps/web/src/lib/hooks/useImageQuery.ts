'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  Image,
  ImageListResponse,
  SortKey,
} from '@picflow/shared';
import { deleteImage, getImageBySlug, listMyImages } from '@/lib/api/images';

export const imageKeys = {
  all: ['images'] as const,
  bySlug: (slug: string) => [...imageKeys.all, 'slug', slug] as const,
  list: (sort: SortKey) => [...imageKeys.all, 'list', sort] as const,
};

export function useImageQuery(slug: string): ReturnType<typeof useQuery<Image>> {
  return useQuery<Image>({
    queryKey: imageKeys.bySlug(slug),
    queryFn: () => getImageBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}

const DEFAULT_PAGE_SIZE = 24;

export function useMyImagesInfinite(
  sort: SortKey = 'newest',
): ReturnType<typeof useInfiniteQuery<ImageListResponse>> {
  return useInfiniteQuery<
    ImageListResponse,
    Error,
    { pages: ImageListResponse[]; pageParams: number[] },
    ReturnType<typeof imageKeys.list>,
    number
  >({
    queryKey: imageKeys.list(sort),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      listMyImages({ page: pageParam, pageSize: DEFAULT_PAGE_SIZE, sort }),
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((sum, p) => sum + p.items.length, 0);
      return loaded < last.total ? all.length + 1 : undefined;
    },
  });
}

export function useDeleteImage(): ReturnType<typeof useMutation<void, Error, string>> {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteImage(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: imageKeys.all });
    },
  });
}
