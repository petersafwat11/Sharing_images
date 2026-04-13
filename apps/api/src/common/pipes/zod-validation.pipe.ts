import { BadRequestException, PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

/**
 * Use in controllers as `@Body(new ZodValidationPipe(MySchema))`.
 * Shares schemas with the frontend via @picflow/shared.
 */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const messages = result.error.issues.map(
        (i) => `${i.path.join('.') || 'body'}: ${i.message}`,
      );
      throw new BadRequestException(messages);
    }
    return result.data;
  }
}
