import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'budi@mahasiswa.ukri.ac.id' })
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email wajib diisi.' })
  email: string;

  @ApiProperty({
    example: 'Password123',
    minLength: 8,
    description: 'Minimal 8 karakter, harus mengandung huruf dan angka.',
  })
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password harus mengandung minimal satu huruf dan satu angka.',
  })
  password: string;

  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi.' })
  namaLengkap: string;

  @ApiProperty({ example: '20210001001' })
  @IsString()
  @IsNotEmpty({ message: 'NIM wajib diisi untuk mahasiswa.' })
  nim: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID fakultas tempat mahasiswa terdaftar. Wajib diisi.',
  })
  @IsUUID('4', { message: 'fakultasId harus berupa UUID yang valid.' })
  @IsNotEmpty({ message: 'fakultasId wajib diisi.' })
  fakultasId: string;
}
