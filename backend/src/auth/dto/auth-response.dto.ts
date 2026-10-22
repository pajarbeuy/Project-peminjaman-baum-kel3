import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  namaLengkap: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ nullable: true })
  nim: string | null;

  @ApiProperty({ nullable: true })
  fakultasId: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token, berlaku 10 menit.' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token, berlaku 7 hari.' })
  refreshToken: string;

  @ApiProperty({ type: () => UserProfileDto })
  user: UserProfileDto;
}
