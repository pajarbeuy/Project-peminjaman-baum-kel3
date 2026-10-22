import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from '../common/enums/role.enum';
import { FacultiesService } from '../faculties/faculties.service';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly facultiesService: FacultiesService,
  ) {}

  /**
   * Registrasi Mahasiswa baru.
   * Role di-hardcode sebagai MAHASISWA; tidak diterima dari request body
   * untuk mencegah privilege escalation.
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const faculty = await this.facultiesService.findById(dto.fakultasId);
    if (!faculty) {
      throw new ConflictException('Fakultas yang dipilih tidak terdaftar.');
    }

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      // Pesan generik agar tidak mengungkap apakah email terdaftar (sesuai keputusan OI-2)
      throw new ConflictException(
        'Registrasi tidak dapat diproses. Periksa kembali data yang Anda masukkan.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      namaLengkap: dto.namaLengkap,
      nim: dto.nim,
      fakultasId: dto.fakultasId,
      role: Role.MAHASISWA, // Hardcode, tidak dari DTO
    });

    return this.generateAndSaveTokens(user.id, {
      sub: user.id,
      email: user.email,
      role: user.role,
      fakultasId: user.fakultasId,
    });
  }

  /**
   * Login untuk semua role.
   * Mengembalikan pesan generik jika email/password salah (OI-2).
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    const genericError = new UnauthorizedException(
      'Email atau password yang Anda masukkan salah.',
    );

    if (!user || !user.isActive) {
      throw genericError;
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw genericError;
    }

    return this.generateAndSaveTokens(user.id, {
      sub: user.id,
      email: user.email,
      role: user.role,
      fakultasId: user.fakultasId,
    });
  }

  /**
   * Refresh access token menggunakan refresh token yang valid.
   * Setelah berhasil, pasangan token baru diterbitkan (refresh token rotation).
   */
  async refreshTokens(
    userId: string,
    refreshTokenFromRequest: string,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.findByIdWithRefreshToken(userId);

    const genericError = new UnauthorizedException(
      'Sesi tidak valid. Silakan login kembali.',
    );

    if (!user || !user.hashedRefreshToken || !user.isActive) {
      throw genericError;
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshTokenFromRequest,
      user.hashedRefreshToken,
    );
    if (!isRefreshTokenValid) {
      throw genericError;
    }

    return this.generateAndSaveTokens(user.id, {
      sub: user.id,
      email: user.email,
      role: user.role,
      fakultasId: user.fakultasId,
    });
  }

  /**
   * Logout: hapus hash refresh token dari DB.
   * Setelah ini, refresh token lama tidak dapat digunakan.
   */
  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Berhasil keluar.' };
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async generateAndSaveTokens(
    userId: string,
    payload: JwtPayload,
  ): Promise<AuthResponseDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: '10m', // Sesuai keputusan OI-4
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    // Simpan hash refresh token di DB (plaintext TIDAK disimpan)
    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      BCRYPT_SALT_ROUNDS,
    );
    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);

    const user = await this.usersService.getProfile(userId);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        namaLengkap: user.namaLengkap,
        email: user.email,
        role: user.role,
        nim: user.nim,
        fakultasId: user.fakultasId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    };
  }
}
