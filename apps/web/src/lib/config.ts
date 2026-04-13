import { z } from 'zod';

/**
 * Client-safe env schema. Only `NEXT_PUBLIC_*` vars are accessible in
 * the browser — accessing anything else will crash at build time.
 */
const PublicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

const parsed = PublicEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!parsed.success) {
  throw new Error(
    `Invalid public env: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
  );
}

export const env = parsed.data;

export const config = {
  apiUrl: env.NEXT_PUBLIC_API_URL.replace(/\/+$/, ''),
  appUrl: env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, ''),
  /** Prefix the NestJS app mounts (see apps/api/src/main.ts). */
  apiPrefix: '/api',
} as const;

export function apiUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${config.apiUrl}${config.apiPrefix}${clean}`;
}

export function shareUrl(slug: string): string {
  return `${config.appUrl}/i/${slug}`;
}
