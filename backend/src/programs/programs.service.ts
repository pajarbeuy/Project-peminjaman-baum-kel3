import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programsRepository: Repository<Program>,
  ) {}

  async findByFacultyId(fakultasId: string): Promise<Program[]> {
    return this.programsRepository.find({
      select: { id: true, nama: true, fakultasId: true },
      where: { fakultasId },
      order: { nama: 'ASC' },
    });
  }

  async findById(id: string): Promise<Program | null> {
    return this.programsRepository.findOne({ where: { id } });
  }
}
