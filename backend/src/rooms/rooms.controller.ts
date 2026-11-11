import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Room } from './entities/room.entity';
import { RoomsService } from './rooms.service';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Daftar ruang aktif beserta status ketersediaan' })
  @ApiQuery({ name: 'date', required: false, description: 'Tanggal peminjaman (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Daftar ruang.', type: [Room] })
  findAll(@Query('date') date?: string): Promise<Array<Room & { status: string }>> {
    return this.roomsService.findAll(date);
  }

  @Public()
  @Get('availability')
  @ApiOperation({ summary: 'Ketersediaan ruang berdasarkan tanggal' })
  @ApiQuery({ name: 'date', required: true, description: 'Tanggal peminjaman (YYYY-MM-DD)' })
  availability(@Query('date') date: string): Promise<Array<Room & { status: string }>> {
    return this.roomsService.findAvailability(date);
  }
}

