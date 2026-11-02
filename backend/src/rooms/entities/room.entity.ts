import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  kode: string;

  @Column({ type: 'tinyint', unsigned: true })
  lantai: number;

  @Column({ type: 'tinyint', unsigned: true })
  nomor: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
