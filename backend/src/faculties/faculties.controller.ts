import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { FacultiesService } from './faculties.service';
import { Faculty } from './entities/faculty.entity';

@ApiTags('Faculties')
@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Daftar fakultas untuk pilihan registrasi' })
  @ApiResponse({ status: 200, description: 'Daftar fakultas.', type: [Faculty] })
  findAll(): Promise<Faculty[]> {
    return this.facultiesService.findAll();
  }
}
