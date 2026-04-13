import { z } from 'zod';

/**
 * Standard envelope returned by the NestJS transform interceptor.
 * `meta` is optional and carries pagination, timing, etc.
 */
export const ApiEnvelopeSchema = <TData extends z.ZodTypeAny>(data: TData) =>
  z.object({
    data,
    meta: z.record(z.unknown()).optional(),
  });

export const ApiErrorSchema = z.object({
  statusCode: z.number().int(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  path: z.string().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
