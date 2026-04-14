import { z } from 'zod';

export const PublicUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  avatarUrl: z.string().url().nullable(),
  storageUsed: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  creditBalance: z.number().int().nonnegative(),
});

export type PublicUser = z.infer<typeof PublicUserSchema>;

export const UpdateUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;
