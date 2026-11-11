import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(date?: string): Promise<Array<Room & { status: string }>> {
    if (date) {
      return this.findAvailability(date);
    }
    const rooms = await this.roomsRepository.find({
      where: { isActive: true },
      order: { lantai: 'ASC', nomor: 'ASC' },
    });
    return rooms.map((room) => ({
      ...room,
      status: room.isActive ? 'Tersedia' : 'Tidak Tersedia',
    }));
  }

  async findAvailability(date: string): Promise<Array<Room & { status: string }>> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ConflictException('Format tanggal harus YYYY-MM-DD.');
    }
    const rows = await this.dataSource.query(
      `SELECT r.*,
        COUNT(CASE WHEN lr.status IN ('DIAJUKAN','DIVERIFIKASI_TU','DIPROSES_BAUM','DISETUJUI','DIKELUARKAN')
          AND lr.tanggalMulai <= ?
          AND DATE_ADD(lr.tanggalMulai, INTERVAL lr.durasiHari DAY) > ?
          THEN lr.id END) AS activeBookings
       FROM rooms r
       LEFT JOIN loan_requests lr ON lr.roomId = r.id
       WHERE r.isActive = 1
       GROUP BY r.id
       ORDER BY r.lantai ASC, r.nomor ASC`,
      [date, date],
    );

    return rows.map((row: Room & { activeBookings: string | number }) => {
      const isBooked = Number(row.activeBookings) > 0;
      let status = 'Tersedia';
      if (!row.isActive) {
        status = 'Tidak Tersedia';
      } else if (isBooked) {
        status = 'Sedang Digunakan';
      }
      return {
        id: row.id,
        kode: row.kode,
        lantai: Number(row.lantai),
        nomor: Number(row.nomor),
        isActive: Boolean(row.isActive),
        status,
      };
    });
  }
}

