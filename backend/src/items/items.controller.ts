import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ItemsService } from './items.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { UseGuards } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(private readonly service: ItemsService) {}
  @Public() @Get() @ApiOperation({ summary: 'Daftar barang dan stok tersedia' }) findAll() { return this.service.findAll(); }
  @Public() @Get('availability') availability(@Query('date') date: string) { return this.service.findAvailability(date); }
  @Get('movements') @UseGuards(RolesGuard) @Roles(Role.BAUM_STAFF) movements() { return this.service.movementsList(); }
  @Public() @Get(':id') findOne(@Param('id') id: string) { return this.service.findById(id); }
  @Post() @UseGuards(RolesGuard) @Roles(Role.BAUM_STAFF) create(@Body() dto: CreateItemDto) { return this.service.create(dto); }
  @Patch(':id') @UseGuards(RolesGuard) @Roles(Role.BAUM_STAFF) update(@Param('id') id: string, @Body() dto: UpdateItemDto) { return this.service.update(id, dto); }
  @Patch(':id/deactivate') @UseGuards(RolesGuard) @Roles(Role.BAUM_STAFF) deactivate(@Param('id') id: string) { return this.service.deactivate(id); }
}
