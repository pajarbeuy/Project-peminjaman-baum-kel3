import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LoanDocumentType } from '../../common/enums/loan-document-type.enum';

@Entity('loan_documents')
export class LoanDocument {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 36 }) loanRequestId: string;
  @Column({ type: 'enum', enum: LoanDocumentType }) jenis: LoanDocumentType;
  @Column({ type: 'varchar', length: 255 }) namaAsli: string;
  @Column({ type: 'varchar', length: 100 }) mimeType: string;
  @Column({ type: 'int', unsigned: true }) ukuran: number;
  @Column({ type: 'varchar', length: 500 }) storagePath: string;
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }) createdAt: Date;
}
