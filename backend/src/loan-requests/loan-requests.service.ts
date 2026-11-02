import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { LoanRequest } from './entities/loan-request.entity';
import { LoanRequestItem } from './entities/loan-request-item.entity';
import { CreateLoanRequestDto } from './dto/create-loan-request.dto';
import { LoanRequestStatus } from '../common/enums/loan-request-status.enum';
import { LoanDocumentType } from '../common/enums/loan-document-type.enum';
import { LoanDocument } from './entities/loan-document.entity';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Item } from '../items/entities/item.entity';
import { Room } from '../rooms/entities/room.entity';
import { Lab } from '../labs/entities/lab.entity';
import type { UploadedDocumentFile } from '../common/interfaces/uploaded-file.interface';

@Injectable()
export class LoanRequestsService {
  constructor(@InjectRepository(LoanRequest) private readonly requests: Repository<LoanRequest>, @InjectRepository(LoanRequestItem) private readonly requestItems: Repository<LoanRequestItem>, @InjectRepository(LoanDocument) private readonly documents: Repository<LoanDocument>, @InjectRepository(Item) private readonly items: Repository<Item>, @InjectRepository(Room) private readonly rooms: Repository<Room>, @InjectRepository(Lab) private readonly labs: Repository<Lab>) {}

  async create(userId: string, dto: CreateLoanRequestDto): Promise<LoanRequest> {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(`${dto.tanggalMulai}T00:00:00`);
    const days = Math.floor((start.getTime() - today.getTime()) / 86400000);
    if (days < 7) throw new BadRequestException('Tanggal peminjaman harus minimal H-7.');
    if ((dto.roomId ? 1 : 0) + (dto.labId ? 1 : 0) !== 1) throw new BadRequestException('Pilih tepat satu ruang atau laboratorium.');
    if (!dto.items?.length) throw new BadRequestException('Minimal satu barang harus diajukan.');
    if (dto.roomId && !(await this.rooms.findOne({ where: { id: dto.roomId, isActive: true } }))) throw new NotFoundException('Ruang tidak ditemukan.');
    if (dto.labId && !(await this.labs.findOne({ where: { id: dto.labId, isActive: true } }))) throw new NotFoundException('Laboratorium tidak ditemukan.');
    const end = new Date(start); end.setDate(end.getDate() + dto.durasiHari);
    const active = [LoanRequestStatus.DIAJUKAN, LoanRequestStatus.DIVERIFIKASI_TU, LoanRequestStatus.DIPROSES_BAUM, LoanRequestStatus.DISETUJUI, LoanRequestStatus.DIKELUARKAN];
    const existing = await this.requests.createQueryBuilder('request').where('request.status IN (:...statuses)', { statuses: active }).andWhere(dto.roomId ? 'request.roomId = :resourceId' : 'request.labId = :resourceId', { resourceId: dto.roomId ?? dto.labId }).andWhere('request.tanggalMulai < :endDate', { endDate: end.toISOString().slice(0,10) }).andWhere('DATE_ADD(request.tanggalMulai, INTERVAL request.durasiHari DAY) > :startDate', { startDate: dto.tanggalMulai }).getOne();
    if (existing) throw new ConflictException('Ruang atau laboratorium tidak tersedia pada tanggal tersebut.');
    const ids = dto.items.map((item) => item.itemId);
    if (new Set(ids).size !== ids.length) throw new BadRequestException('Barang tidak boleh duplikat dalam satu pengajuan.');
    const dbItems = await this.items.find({ where: { id: In(ids), isActive: true } });
    if (dbItems.length !== ids.length) throw new NotFoundException('Salah satu barang tidak ditemukan.');
    for (const requested of dto.items) { const item = dbItems.find((candidate) => candidate.id === requested.itemId)!; if (requested.jumlah > item.totalStok - item.jumlahDipinjam) throw new ConflictException(`Stok barang ${item.nama} tidak mencukupi.`); }
    const request = await this.requests.save(this.requests.create({ userId, tanggalMulai: dto.tanggalMulai, durasiHari: dto.durasiHari, keperluan: dto.keperluan, unitKerja: dto.unitKerja, penanggungJawab: dto.penanggungJawab, kontakPeminjam: dto.kontakPeminjam, roomId: dto.roomId ?? null, labId: dto.labId ?? null, status: LoanRequestStatus.DIAJUKAN }));
    await this.requestItems.save(dto.items.map((item) => this.requestItems.create({ loanRequestId: request.id, itemId: item.itemId, jumlah: item.jumlah })));
    return request;
  }
  async findMine(userId: string): Promise<LoanRequest[]> { return this.requests.find({ where: { userId }, order: { createdAt: 'DESC' } }); }
  async addDocument(userId: string, requestId: string, jenis: string, file: UploadedDocumentFile): Promise<LoanDocument> {
    const request = await this.requests.findOne({ where: { id: requestId, userId } });
    if (!request) throw new NotFoundException('Pengajuan tidak ditemukan.');
    if (!Object.values(LoanDocumentType).includes(jenis as LoanDocumentType)) throw new BadRequestException('Jenis dokumen tidak valid.');
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype)) throw new BadRequestException('Format dokumen tidak didukung.');
    const maxBytes = Number(process.env.UPLOAD_MAX_BYTES ?? 10 * 1024 * 1024);
    if (file.size > maxBytes) throw new BadRequestException('Ukuran dokumen melebihi batas konfigurasi.');
    const relativePath = join('storage', 'private', 'documents', `${randomUUID()}`);
    const absolutePath = join(process.cwd(), relativePath);
    await mkdir(join(process.cwd(), 'storage', 'private', 'documents'), { recursive: true });
    await writeFile(absolutePath, file.buffer);
    return this.documents.save(this.documents.create({ loanRequestId: requestId, jenis: jenis as LoanDocumentType, namaAsli: file.originalname, mimeType: file.mimetype, ukuran: file.size, storagePath: relativePath }));
  }
}
