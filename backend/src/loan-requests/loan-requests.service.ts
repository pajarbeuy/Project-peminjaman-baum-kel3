import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { LoanRequest } from './entities/loan-request.entity';
import { LoanRequestItem } from './entities/loan-request-item.entity';
import { CreateLoanRequestDto } from './dto/create-loan-request.dto';
import { LoanRequestStatus } from '../common/enums/loan-request-status.enum';
import { LoanDocumentType } from '../common/enums/loan-document-type.enum';
import { LoanDocument } from './entities/loan-document.entity';
import { Role } from '../common/enums/role.enum';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Item } from '../items/entities/item.entity';
import { Room } from '../rooms/entities/room.entity';
import { Lab } from '../labs/entities/lab.entity';
import type { UploadedDocumentFile } from '../common/interfaces/uploaded-file.interface';
import { StockMovement } from '../stock/entities/stock-movement.entity';
import { StockMovementType } from '../common/enums/stock-movement-type.enum';

@Injectable()
export class LoanRequestsService {
  constructor(@InjectRepository(LoanRequest) private readonly requests: Repository<LoanRequest>, @InjectRepository(LoanRequestItem) private readonly requestItems: Repository<LoanRequestItem>, @InjectRepository(LoanDocument) private readonly documents: Repository<LoanDocument>, @InjectRepository(StockMovement) private readonly movements: Repository<StockMovement>, @InjectRepository(Item) private readonly items: Repository<Item>, @InjectRepository(Room) private readonly rooms: Repository<Room>, @InjectRepository(Lab) private readonly labs: Repository<Lab>) {}

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
    const request = await this.requests.manager.transaction(async (manager) => {
      const lockedItems = await manager.getRepository(Item).createQueryBuilder('item').where('item.id IN (:...ids)', { ids }).andWhere('item.isActive = 1').setLock('pessimistic_write').getMany();
      for (const requested of dto.items) { const item = lockedItems.find((candidate) => candidate.id === requested.itemId); if (!item || requested.jumlah > item.totalStok - item.jumlahDipinjam) throw new ConflictException(`Stok barang ${item?.nama ?? requested.itemId} tidak mencukupi.`); }
      const created = await manager.getRepository(LoanRequest).save(manager.getRepository(LoanRequest).create({ userId, tanggalMulai: dto.tanggalMulai, durasiHari: dto.durasiHari, keperluan: dto.keperluan, unitKerja: dto.unitKerja, penanggungJawab: dto.penanggungJawab, kontakPeminjam: dto.kontakPeminjam, roomId: dto.roomId ?? null, labId: dto.labId ?? null, status: LoanRequestStatus.DRAFT, rejectionReason: null }));
      await manager.getRepository(LoanRequestItem).save(dto.items.map((item) => manager.getRepository(LoanRequestItem).create({ loanRequestId: created.id, itemId: item.itemId, jumlah: item.jumlah })));
      return created;
    });
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

  async submit(userId: string, requestId: string, role: Role): Promise<LoanRequest> {
    const request = await this.requests.findOne({ where: { id: requestId, userId } });
    if (!request) throw new NotFoundException('Pengajuan tidak ditemukan.');
    if (request.status !== LoanRequestStatus.DRAFT) throw new ConflictException('Pengajuan sudah dikirim atau tidak dapat dikirim ulang.');
    const documents = await this.documents.find({ where: { loanRequestId: requestId } });
    const types = new Set(documents.map((document) => document.jenis));
    if (!types.has(LoanDocumentType.SURAT_BIDANG_3) || !types.has(LoanDocumentType.BIODATA_ORMAWA) || (role === Role.MAHASISWA && !types.has(LoanDocumentType.KTM))) throw new BadRequestException('Dokumen wajib belum lengkap.');
    request.status = LoanRequestStatus.DIAJUKAN;
    return this.requests.save(request);
  }

  async transition(requestId: string, actorId: string, role: Role, action: 'verify' | 'process' | 'approve' | 'reject', reason?: string): Promise<LoanRequest> {
    const request = await this.requests.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Pengajuan tidak ditemukan.');
    if (action === 'reject') {
      if (![Role.TU, Role.BAUM_STAFF, Role.KABAG_UMUM].includes(role) || !reason?.trim()) throw new BadRequestException('Alasan penolakan wajib diisi.');
      request.status = LoanRequestStatus.DITOLAK; request.rejectionReason = reason.trim();
    } else if (action === 'verify' && role === Role.TU && request.status === LoanRequestStatus.DIAJUKAN) request.status = LoanRequestStatus.DIVERIFIKASI_TU;
    else if (action === 'process' && role === Role.BAUM_STAFF && request.status === LoanRequestStatus.DIVERIFIKASI_TU) request.status = LoanRequestStatus.DIPROSES_BAUM;
    else if (action === 'approve' && [Role.BAUM_STAFF, Role.KABAG_UMUM].includes(role) && request.status === LoanRequestStatus.DIPROSES_BAUM) request.status = LoanRequestStatus.DISETUJUI;
    else throw new ConflictException('Transisi status atau role tidak valid.');
    return this.requests.save(request);
  }

  async handover(requestId: string, actorId: string): Promise<LoanRequest> { return this.moveStock(requestId, actorId, StockMovementType.KELUAR); }
  async returnItems(requestId: string, actorId: string): Promise<LoanRequest> { return this.moveStock(requestId, actorId, StockMovementType.KEMBALI); }
  private async moveStock(requestId: string, actorId: string, type: StockMovementType): Promise<LoanRequest> {
    return this.requests.manager.transaction(async (manager) => {
      const request = await manager.getRepository(LoanRequest).findOne({ where: { id: requestId } });
      if (!request || (type === StockMovementType.KELUAR ? request.status !== LoanRequestStatus.DISETUJUI : request.status !== LoanRequestStatus.DIKELUARKAN)) throw new ConflictException('Status pengajuan tidak sesuai untuk operasi stok.');
      const details = await manager.getRepository(LoanRequestItem).find({ where: { loanRequestId: requestId } });
      for (const detail of details) {
        if (await manager.getRepository(StockMovement).findOne({ where: { loanRequestId: requestId, itemId: detail.itemId, jenis: type } })) throw new ConflictException('Pergerakan stok ini sudah dicatat.');
        const item = await manager.getRepository(Item).createQueryBuilder('item').where('item.id = :id', { id: detail.itemId }).setLock('pessimistic_write').getOne();
        if (!item) throw new NotFoundException('Barang tidak ditemukan.');
        if (type === StockMovementType.KELUAR) { if (item.totalStok - item.jumlahDipinjam < detail.jumlah) throw new ConflictException(`Stok ${item.nama} tidak mencukupi.`); item.jumlahDipinjam += detail.jumlah; } else { if (item.jumlahDipinjam < detail.jumlah) throw new ConflictException(`Jumlah stok keluar ${item.nama} tidak konsisten.`); item.jumlahDipinjam -= detail.jumlah; }
        await manager.getRepository(Item).save(item);
        await manager.getRepository(StockMovement).save(manager.getRepository(StockMovement).create({ itemId: detail.itemId, loanRequestId: requestId, jenis: type, jumlah: detail.jumlah, actorId, kondisi: null }));
      }
      request.status = type === StockMovementType.KELUAR ? LoanRequestStatus.DIKELUARKAN : LoanRequestStatus.SELESAI;
      return manager.getRepository(LoanRequest).save(request);
    });
  }
}
