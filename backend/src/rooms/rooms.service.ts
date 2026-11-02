import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
  ) {}

  async findAll(): Promise<Room[]> {
    return this.roomsRepository.find({
      where: { isActive: true },
      order: { lantai: 'ASC', nomor: 'ASC' },
    });
  }
}
