import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 50, unique: true }) kode: string;
  @Column({ type: 'varchar', length: 255 }) nama: string;
  @Column({ type: 'varchar', length: 100 }) kategori: string;
  @Column({ type: 'int', unsigned: true }) totalStok: number;
  @Column({ type: 'int', unsigned: true, default: 0 }) jumlahDipinjam: number;
  @Column({ type: 'boolean', default: true }) isActive: boolean;
}
