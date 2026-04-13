import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import type { AuthResponse } from '@picflow/shared';
import { AuthService } from '../auth.service';

/**
 * Local (email+password) strategy used by LocalAuthGuard on /auth/login.
 * Returns the AuthResponse attached to `req.user`.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly auth: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string): Promise<AuthResponse> {
    const result = await this.auth.login(email, password);
    if (!result) throw new UnauthorizedException();
    return result;
  }
}
