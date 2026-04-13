import { z } from 'zod';

export const ImageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number().int().nonnegative(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  originalUrl: z.string().url(),
  thumbUrl: z.string().url().nullable(),
  webpUrl: z.string().url().nullable(),
  blurHash: z.string().nullable(),
  views: z.number().int().nonnegative(),
  isPublic: z.boolean(),
  userId: z.string().nullable(),
  expiresAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Image = z.infer<typeof ImageSchema>;

export const ImageListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(60).default(24),
  sort: z
    .enum(['newest', 'oldest', 'most-viewed', 'largest'])
    .default('newest'),
});

export type ImageListQuery = z.infer<typeof ImageListQuerySchema>;

export const ImageListResponseSchema = z.object({
  items: z.array(ImageSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type ImageListResponse = z.infer<typeof ImageListResponseSchema>;
