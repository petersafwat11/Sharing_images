import { z } from 'zod';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  SLUG_LENGTH,
} from '../constants';

/**
 * Schema for `POST /upload/presign` request body.
 * The client tells the API what it wants to upload; the API decides
 * whether the type/size is acceptable before generating an R2 URL.
 */
export const PresignRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE_BYTES, {
      message: `File size must not exceed ${MAX_FILE_SIZE_BYTES} bytes`,
    }),
});

export type PresignRequest = z.infer<typeof PresignRequestSchema>;

export const PresignResponseSchema = z.object({
  uploadUrl: z.string().url(),
  slug: z.string().length(SLUG_LENGTH),
  key: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export type PresignResponse = z.infer<typeof PresignResponseSchema>;

/**
 * Schema for `POST /upload/confirm` — fired by the client AFTER the
 * direct R2 upload completes. The API verifies the object exists in
 * R2 and persists the metadata row.
 */
export const ConfirmUploadSchema = z.object({
  key: z.string().min(1),
  slug: z.string().length(SLUG_LENGTH),
});

export type ConfirmUploadRequest = z.infer<typeof ConfirmUploadSchema>;

export const ConfirmUploadResponseSchema = z.object({
  slug: z.string().length(SLUG_LENGTH),
  shareUrl: z.string().url(),
});

export type ConfirmUploadResponse = z.infer<typeof ConfirmUploadResponseSchema>;
