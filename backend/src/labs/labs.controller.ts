import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Lab } from './entities/lab.entity';
import { LabsService } from './labs.service';

@ApiTags('Labs')
@Controller('labs')
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Daftar laboratorium aktif' })
  @ApiResponse({ status: 200, description: 'Daftar laboratorium.', type: [Lab] })
  findAll(): Promise<Lab[]> {
    return this.labsService.findAll();
  }
}
