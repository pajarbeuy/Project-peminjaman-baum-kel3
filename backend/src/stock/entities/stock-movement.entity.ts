import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StockMovementType } from '../../common/enums/stock-movement-type.enum';
@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 36 }) itemId: string;
  @Column({ type: 'varchar', length: 36 }) loanRequestId: string;
  @Column({ type: 'enum', enum: StockMovementType }) jenis: StockMovementType;
  @Column({ type: 'int', unsigned: true }) jumlah: number;
  @Column({ type: 'varchar', length: 36 }) actorId: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) kondisi: string | null;
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }) createdAt: Date;
}
