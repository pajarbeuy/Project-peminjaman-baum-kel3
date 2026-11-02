import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LoanRequestStatus } from '../../common/enums/loan-request-status.enum';

@Entity('loan_requests')
export class LoanRequest {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 36 }) userId: string;
  @Column({ type: 'date' }) tanggalMulai: string;
  @Column({ type: 'int', unsigned: true }) durasiHari: number;
  @Column({ type: 'varchar', length: 1000 }) keperluan: string;
  @Column({ type: 'varchar', length: 255 }) unitKerja: string;
  @Column({ type: 'varchar', length: 255 }) penanggungJawab: string;
  @Column({ type: 'varchar', length: 50 }) kontakPeminjam: string;
  @Column({ type: 'varchar', length: 36, nullable: true }) roomId: string | null;
  @Column({ type: 'varchar', length: 36, nullable: true }) labId: string | null;
  @Column({ type: 'enum', enum: LoanRequestStatus, default: LoanRequestStatus.DIAJUKAN }) status: LoanRequestStatus;
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }) createdAt: Date;
}
