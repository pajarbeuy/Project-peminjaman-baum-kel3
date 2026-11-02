import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectLoanRequestDto {
  @ApiProperty({ example: 'Dokumen belum sesuai.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  alasan: string;
}
