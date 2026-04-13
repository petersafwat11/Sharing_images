import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Global exception filter. Produces a consistent error envelope
 * compatible with @picflow/shared ApiErrorSchema and never leaks
 * stack traces in production.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, error } = this.resolveError(exception);

    if (status >= 500) {
      this.logger.error(
        `[${request.method} ${request.url}] ${error ?? 'Error'}: ${
          Array.isArray(message) ? message.join('; ') : message
        }`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private resolveError(exception: unknown): {
    status: number;
    message: string | string[];
    error: string;
  } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        return {
          status: exception.getStatus(),
          message: res,
          error: exception.name,
        };
      }
      const obj = res as { message?: string | string[]; error?: string };
      return {
        status: exception.getStatus(),
        message: obj.message ?? exception.message,
        error: obj.error ?? exception.name,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'InternalServerError',
    };
  }
}
