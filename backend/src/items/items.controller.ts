import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ItemsService } from './items.service';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(private readonly service: ItemsService) {}
  @Public() @Get() @ApiOperation({ summary: 'Daftar barang dan stok tersedia' }) findAll() { return this.service.findAll(); }
  @Public() @Get(':id') findOne(@Param('id') id: string) { return this.service.findById(id); }
}
