import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard untuk endpoint POST /auth/refresh.
 * Memvalidasi refresh token (secret berbeda dari access token).
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
