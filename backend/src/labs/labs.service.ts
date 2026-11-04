import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lab } from './entities/lab.entity';

@Injectable()
export class LabsService {
  constructor(
    @InjectRepository(Lab)
    private readonly labsRepository: Repository<Lab>,
  ) {}

  async findAll(): Promise<Lab[]> {
    return this.labsRepository.find({
      where: { isActive: true },
      order: { nama: 'ASC', kode: 'ASC' },
    });
  }
}
