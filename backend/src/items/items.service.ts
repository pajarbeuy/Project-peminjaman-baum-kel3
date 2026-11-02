import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {
  constructor(@InjectRepository(Item) private readonly repo: Repository<Item>) {}
  async findAll(): Promise<Array<Item & { stokTersedia: number }>> {
    const items = await this.repo.find({ where: { isActive: true }, order: { nama: 'ASC' } });
    return items.map((item) => ({ ...item, stokTersedia: item.totalStok - item.jumlahDipinjam }));
  }
  async findById(id: string): Promise<Item> {
    const item = await this.repo.findOne({ where: { id, isActive: true } });
    if (!item) throw new NotFoundException('Barang tidak ditemukan.');
    return item;
  }
}
