import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Requires a valid JWT. Returns 401 otherwise.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
