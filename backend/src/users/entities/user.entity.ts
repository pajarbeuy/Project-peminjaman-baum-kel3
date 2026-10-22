import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, length: 255 })
  email: string;

  /**
   * Password hash bcrypt — TIDAK dikembalikan di query default (select: false).
   * Gunakan addSelect('user.password') hanya saat proses login.
   */
  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'varchar', length: 255 })
  namaLengkap: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  /**
   * NIM: wajib untuk Mahasiswa (BR-02), null untuk role lain.
   */
  @Column({ type: 'varchar', nullable: true, length: 50 })
  nim: string | null;

  /**
   * Merujuk ke tabel fakultas (FK akan ditambah pada migration berikutnya).
   * Wajib untuk Mahasiswa (scope registrasi) dan TU (scope verifikasi BR-03).
   */
  @Column({ nullable: true, type: 'varchar', length: 36 })
  fakultasId: string | null;

  /**
   * Hash refresh token — select: false agar tidak bocor ke response.
   * Di-clear saat logout.
   */
  @Column({ type: 'varchar', nullable: true, select: false })
  hashedRefreshToken: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
