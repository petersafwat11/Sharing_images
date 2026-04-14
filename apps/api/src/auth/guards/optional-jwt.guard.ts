import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

/**
 * For endpoints that work anonymously AND authenticated. Attaches
 * `req.user` if a valid JWT is present, silently allows the request
 * if no token is present or the token is invalid.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  override handleRequest<TUser = AuthenticatedUser>(
    _err: unknown,
    user: TUser | false,
  ): TUser | undefined {
    return user ? (user as TUser) : undefined;
  }
}
