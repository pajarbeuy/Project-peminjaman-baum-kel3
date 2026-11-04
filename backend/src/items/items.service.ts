import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { StockMovement } from '../stock/entities/stock-movement.entity';

@Injectable()
export class ItemsService {
  constructor(@InjectRepository(Item) private readonly repo: Repository<Item>, @InjectRepository(StockMovement) private readonly movements: Repository<StockMovement>, private readonly dataSource: DataSource) {}
  async findAll(): Promise<Array<Item & { stokTersedia: number }>> {
    const items = await this.repo.find({ where: { isActive: true }, order: { nama: 'ASC' } });
    return items.map((item) => ({ ...item, stokTersedia: item.totalStok - item.jumlahDipinjam }));
  }
  async findById(id: string): Promise<Item> {
    const item = await this.repo.findOne({ where: { id, isActive: true } });
    if (!item) throw new NotFoundException('Barang tidak ditemukan.');
    return item;
  }
  async findAvailability(date: string): Promise<Array<Item & { stokTersedia: number; jumlahTerpakai: number }>> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ConflictException('Format tanggal harus YYYY-MM-DD.');
    const rows = await this.dataSource.query(`SELECT i.*, COALESCE(SUM(CASE WHEN lr.status IN ('DIAJUKAN','DIVERIFIKASI_TU','DIPROSES_BAUM','DISETUJUI','DIKELUARKAN') AND lr.tanggalMulai <= ? AND DATE_ADD(lr.tanggalMulai, INTERVAL lr.durasiHari DAY) > ? THEN lri.jumlah ELSE 0 END), 0) AS jumlahTerpakai FROM items i LEFT JOIN loan_request_items lri ON lri.itemId = i.id LEFT JOIN loan_requests lr ON lr.id = lri.loanRequestId WHERE i.isActive = 1 GROUP BY i.id ORDER BY i.nama ASC`, [date, date]);
    return rows.map((row: Item & { jumlahTerpakai: string }) => ({ ...row, jumlahTerpakai: Number(row.jumlahTerpakai), stokTersedia: row.totalStok - Number(row.jumlahDipinjam) - Number(row.jumlahTerpakai) }));
  }
  async create(dto: CreateItemDto): Promise<Item> { try { return await this.repo.save(this.repo.create({ ...dto, jumlahDipinjam: 0, isActive: true })); } catch { throw new ConflictException('Kode barang sudah digunakan.'); } }
  async update(id: string, dto: UpdateItemDto): Promise<Item> { const item = await this.repo.findOne({ where: { id } }); if (!item) throw new NotFoundException('Barang tidak ditemukan.'); Object.assign(item, dto); if (item.totalStok < item.jumlahDipinjam) throw new ConflictException('Total stok tidak boleh lebih kecil dari jumlah yang sedang dipinjam.'); return this.repo.save(item); }
  async deactivate(id: string): Promise<Item> { const item = await this.repo.findOne({ where: { id } }); if (!item) throw new NotFoundException('Barang tidak ditemukan.'); item.isActive = false; return this.repo.save(item); }
  async movementsList() { return this.movements.find({ order: { createdAt: 'DESC' } }); }
}
