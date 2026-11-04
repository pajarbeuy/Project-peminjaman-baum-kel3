import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('labs')
export class Lab {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  kode: string;

  @Column({ type: 'varchar', length: 255 })
  nama: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pengelola: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
