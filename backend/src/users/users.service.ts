import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Cari user berdasarkan email.
   * Tidak menyertakan password dan hashedRefreshToken (select: false pada entity).
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Cari user berdasarkan email dan sertakan kolom password (hanya untuk proses auth).
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * Cari user berdasarkan ID.
   */
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /**
   * Cari user berdasarkan ID dan sertakan hashedRefreshToken (hanya untuk validasi refresh).
   */
  async findByIdWithRefreshToken(id: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.hashedRefreshToken')
      .where('user.id = :id', { id })
      .getOne();
  }

  /**
   * Buat user baru. Dipanggil dari AuthService setelah validasi dan hash password.
   */
  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  /**
   * Simpan hash refresh token ke DB. Dipanggil setelah token digenerate.
   */
  async updateRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ): Promise<void> {
    await this.usersRepository.update(userId, { hashedRefreshToken });
  }

  /**
   * Ambil profil user berdasarkan ID.
   * Digunakan untuk endpoint GET /users/me.
   * Melempar NotFoundException jika tidak ditemukan atau tidak aktif.
   */
  async getProfile(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, isActive: true },
    });
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }
    return user;
  }
}
