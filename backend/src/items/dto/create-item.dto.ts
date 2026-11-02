import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
export class CreateItemDto {
  @ApiProperty() @IsString() @IsNotEmpty() kode: string;
  @ApiProperty() @IsString() @IsNotEmpty() nama: string;
  @ApiProperty() @IsString() @IsNotEmpty() kategori: string;
  @ApiProperty() @IsInt() @Min(0) totalStok: number;
}
