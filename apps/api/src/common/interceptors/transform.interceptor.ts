import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Wraps every controller response in `{ data, meta? }`.
 * If a handler already returns an envelope (has `data` key), pass through.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiEnvelope<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiEnvelope<T>> {
    return next.handle().pipe(
      map((value) => {
        if (
          value &&
          typeof value === 'object' &&
          'data' in (value as Record<string, unknown>)
        ) {
          return value as unknown as ApiEnvelope<T>;
        }
        return { data: value };
      }),
    );
  }
}
