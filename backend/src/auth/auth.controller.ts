import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registrasi Mahasiswa baru.
   * Role otomatis MAHASISWA; TU/BAUM didaftarkan via seed.
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrasi akun Mahasiswa baru' })
  @ApiResponse({
    status: 201,
    description: 'Registrasi berhasil.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validasi input gagal.',
  })
  @ApiResponse({
    status: 409,
    description: 'Registrasi tidak dapat diproses.',
  })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  /**
   * Login untuk semua role.
   * Mengembalikan access token (10 menit) + refresh token (7 hari).
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login semua role (Mahasiswa, TU, BAUM, dll.)' })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Email atau password salah.',
  })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  /**
   * Perbarui access token menggunakan refresh token.
   * Menerapkan refresh token rotation: token lama diinvalidasi, pasangan baru diterbitkan.
   */
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('refresh-token')
  @ApiOperation({
    summary: 'Perbarui access token menggunakan refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token berhasil diperbarui.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token tidak valid atau sudah kedaluwarsa.',
  })
  refresh(
    @CurrentUser() user: JwtPayload & { refreshToken: string },
  ): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }

  /**
   * Logout: invalidasi refresh token di server.
   * Setelah logout, refresh token lama tidak dapat digunakan.
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout dan invalidasi refresh token' })
  @ApiResponse({ status: 200, description: 'Berhasil keluar.' })
  logout(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    return this.authService.logout(user.sub);
  }
}
