import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Strategi untuk memvalidasi ACCESS TOKEN.
 * Mengambil token dari header Authorization: Bearer <token>.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Dipanggil oleh Passport setelah token berhasil diverifikasi.
   * Nilai yang dikembalikan akan tersedia sebagai req.user di controller.
   */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
