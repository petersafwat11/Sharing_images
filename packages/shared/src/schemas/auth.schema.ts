import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email().toLowerCase(),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: 'Username may only contain letters, numbers, _ and -',
    }),
  password: z.string().min(8).max(128),
});

export type RegisterRequest = z.infer<typeof RegisterSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
    avatarUrl: z.string().url().nullable(),
  }),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
