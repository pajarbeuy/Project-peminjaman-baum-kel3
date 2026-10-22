import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import type { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Ambil profil user yang sedang login.
   * Sesuai security.md: user hanya boleh membaca data miliknya.
   */
  @Get('me')
  @ApiOperation({ summary: 'Ambil profil user yang sedang login' })
  @ApiResponse({
    status: 200,
    description: 'Profil berhasil diambil.',
  })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi.' })
  getMe(@CurrentUser() user: JwtPayload): Promise<User> {
    return this.usersService.getProfile(user.sub);
  }
}
