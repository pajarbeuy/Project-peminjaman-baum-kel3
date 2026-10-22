import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from './entities/faculty.entity';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultiesRepository: Repository<Faculty>,
  ) {}

  async findAll(): Promise<Faculty[]> {
    return this.facultiesRepository.find({
      select: { id: true, nama: true },
      order: { nama: 'ASC' },
    });
  }

  async findById(id: string): Promise<Faculty | null> {
    return this.facultiesRepository.findOne({ where: { id } });
  }
}
