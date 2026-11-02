import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nama: string;

  @Column({ type: 'varchar', length: 36 })
  fakultasId: string;
}
