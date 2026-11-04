import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('loan_request_items')
export class LoanRequestItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 36 }) loanRequestId: string;
  @Column({ type: 'varchar', length: 36 }) itemId: string;
  @Column({ type: 'int', unsigned: true }) jumlah: number;
}
