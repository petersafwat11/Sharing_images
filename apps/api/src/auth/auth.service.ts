import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthResponse, PublicUser } from '@picflow/shared';
import * as bcrypt from 'bcrypt';
import { AppConfigService } from '../config/app-config.service';
import { CreditsService } from '../credits/credits.service';
import { UsersService } from '../users/users.service';

const BCRYPT_ROUNDS = 12;

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
    private readonly credits: CreditsService,
  ) {}

  async register(
    email: string,
    username: string,
    password: string,
  ): Promise<AuthResponse> {
    const exists = await this.users.existsByEmailOrUsername(email, username);
    if (exists) {
      throw new ConflictException('Email or username already taken');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.users.create({ email, username, passwordHash });
    // Write audit ledger entry for the 3 credits already seeded by DB default
    await this.credits.awardSignupBonus(user.id);
    return this.signResponse(user);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.users.findByEmailWithHash(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.signResponse({
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
    });
  }

  private signResponse(
    user: Pick<PublicUser, 'id' | 'email' | 'username' | 'avatarUrl'>,
  ): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
    });
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
