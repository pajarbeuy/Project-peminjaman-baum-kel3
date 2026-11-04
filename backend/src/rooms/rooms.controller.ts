import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Room } from './entities/room.entity';
import { RoomsService } from './rooms.service';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Daftar ruang aktif' })
  @ApiResponse({ status: 200, description: 'Daftar ruang.', type: [Room] })
  findAll(): Promise<Room[]> {
    return this.roomsService.findAll();
  }
}
