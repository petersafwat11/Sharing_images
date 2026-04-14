/**
 * Centralized constants shared between web and api.
 * Single source of truth for upload limits, MIME types, and slug rules.
 */

export const SLUG_LENGTH = 8;

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MIME_TO_EXT: Record<AllowedMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

export const RATE_LIMITS = {
  ANONYMOUS_UPLOADS_PER_HOUR: 20,
  AUTHENTICATED_UPLOADS_PER_HOUR: 200,
} as const;

export const PRESIGNED_URL_TTL_SECONDS = 60 * 15; // 15 minutes

export const IMAGE_CACHE_TTL_SECONDS = 60 * 60; // 1 hour
export const USER_IMAGES_CACHE_TTL_SECONDS = 60 * 5; // 5 minutes

export const VIEW_FLUSH_INTERVAL_MS = 1000 * 60 * 5; // 5 minutes

export const THUMBNAIL_WIDTH_PX = 400;

export const QUEUE_NAMES = {
  IMAGE_PROCESSING: 'image-processing',
  VIEW_FLUSH: 'view-flush',
} as const;

/** Redis set tracking which slugs have pending view increments. */
export const VIEW_TRACKED_SET_KEY = 'img:views:tracked';
