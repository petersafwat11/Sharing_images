import { z } from 'zod';

/**
 * Zod schema for process.env. Validated at startup via ConfigModule.
 * Missing/malformed values must crash the app — never fall back silently.
 */
export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // AWS S3 (active storage backend)
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_S3_BUCKET: z.string().min(1),

  // Cloudflare R2 — reserved for future migration; optional for now
  R2_ACCOUNT_ID: z.string().default(''),
  R2_ACCESS_KEY_ID: z.string().default(''),
  R2_SECRET_ACCESS_KEY: z.string().default(''),
  R2_BUCKET_NAME: z.string().default(''),
  R2_PUBLIC_URL: z.string().url().default('http://localhost:9000'),
  R2_ENDPOINT: z.string().url().default('http://localhost:9000'),

  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001'),

  // Replicate API (AI portrait generation) — required in production
  REPLICATE_API_TOKEN: z.string().default(''),
  REPLICATE_WEBHOOK_SECRET: z.string().default('dev-webhook-secret-placeholder-32ch'),

  // Resend (email notifications) — required in production
  RESEND_API_KEY: z.string().default(''),

  // Stripe (payments) — required in production
  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),

  // Phase 4 — admin + print
  ADMIN_USER_ID: z.string().default(''),
  GELATO_API_KEY: z.string().default(''),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}
