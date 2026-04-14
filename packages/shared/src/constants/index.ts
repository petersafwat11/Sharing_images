export * from './themes';

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
  PORTRAIT_GENERATION: 'portrait-generation',
} as const;

/** Redis set tracking which slugs have pending view increments. */
export const VIEW_TRACKED_SET_KEY = 'img:views:tracked';

// ── Portrait constants ─────────────────────────────────────────────────────
export const MIN_PORTRAIT_INPUTS = 1;
export const MAX_PORTRAIT_INPUTS = 5;
export const PORTRAIT_NUM_OUTPUTS = 4;
export const PORTRAIT_EXPIRY_DAYS_ANONYMOUS = 7;
export const PORTRAIT_GENERATION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
export const REPLICATE_POLL_INTERVAL_MS = 5_000; // 5 seconds

/**
 * tencentarc/photomaker version pinned for stability.
 * Verify at https://replicate.com/tencentarc/photomaker/versions
 */
export const PHOTOMAKER_MODEL_VERSION =
  'ddfc2b08d209f9fa8c1eca692712918bd449f695d399ad05d3aefecf538b0007';

// ── Credit system ──────────────────────────────────────────────────────────

export const CREDITS_ON_SIGNUP = 3;

export const CREDIT_PACKS = [
  {
    id: 'starter' as const,
    label: 'Starter',
    credits: 5,
    priceUsd: 499,           // in cents
    priceDisplay: '$4.99',
    perGenDisplay: '$1.00/portrait',
  },
  {
    id: 'popular' as const,
    label: 'Popular',
    credits: 15,
    priceUsd: 1199,
    priceDisplay: '$11.99',
    perGenDisplay: '$0.80/portrait',
    badge: 'Most Popular' as const,
  },
  {
    id: 'pro' as const,
    label: 'Pro',
    credits: 40,
    priceUsd: 2499,
    priceDisplay: '$24.99',
    perGenDisplay: '$0.62/portrait',
  },
] as const;

export type CreditPackId = (typeof CREDIT_PACKS)[number]['id'];
