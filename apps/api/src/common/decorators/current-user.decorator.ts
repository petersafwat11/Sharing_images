import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Shape attached to `req.user` by JwtStrategy.validate().
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
}

/**
 * `@CurrentUser()` → AuthenticatedUser (throws if route is not guarded).
 * `@CurrentUser() user?: AuthenticatedUser` → undefined on anonymous routes
 * guarded by OptionalJwtAuthGuard.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const req = ctx.switchToHttp().getRequest<Request & {
      user?: AuthenticatedUser;
    }>();
    return req.user;
  },
);
