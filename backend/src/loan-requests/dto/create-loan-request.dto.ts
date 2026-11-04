import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsNotEmpty, IsString, IsUUID, Min, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LoanRequestItemDto {
  @ApiProperty() @IsUUID('4') itemId: string;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) jumlah: number;
}
export class CreateLoanRequestDto {
  @ApiProperty() @IsDateString() tanggalMulai: string;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) durasiHari: number;
  @ApiProperty() @IsString() @IsNotEmpty() keperluan: string;
  @ApiProperty() @IsString() @IsNotEmpty() unitKerja: string;
  @ApiProperty() @IsString() @IsNotEmpty() penanggungJawab: string;
  @ApiProperty() @IsString() @IsNotEmpty() kontakPeminjam: string;
  @ApiPropertyOptional() @ValidateIf((o) => !o.labId) @IsUUID('4') roomId?: string;
  @ApiPropertyOptional() @ValidateIf((o) => !o.roomId) @IsUUID('4') labId?: string;
  @ApiProperty({ type: [LoanRequestItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => LoanRequestItemDto) items: LoanRequestItemDto[];
}
