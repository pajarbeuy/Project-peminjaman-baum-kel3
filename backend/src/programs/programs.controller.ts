import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Program } from './entities/program.entity';
import { ProgramsService } from './programs.service';

@ApiTags('Programs')
@Controller('faculties/:fakultasId/programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Daftar program studi berdasarkan fakultas' })
  @ApiParam({ name: 'fakultasId', description: 'UUID fakultas' })
  @ApiResponse({ status: 200, description: 'Daftar program studi.', type: [Program] })
  findByFaculty(@Param('fakultasId') fakultasId: string): Promise<Program[]> {
    return this.programsService.findByFacultyId(fakultasId);
  }
}
