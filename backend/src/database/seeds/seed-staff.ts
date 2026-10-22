/**
 * Seed Script: Membuat akun default untuk staf TU dan BAUM.
 *
 * Akun-akun ini TIDAK bisa dibuat melalui endpoint publik /auth/register
 * (yang hanya untuk Mahasiswa).
 *
 * Cara menjalankan:
 *   npx ts-node src/database/seeds/seed-staff.ts
 *
 * PENTING:
 * - Ganti email dan password sebelum menjalankan di lingkungan production.
 * - Jangan commit password nyata ke repository (gunakan .env atau vault).
 * - Script ini idempotent: jika email sudah ada, baris tersebut di-skip.
 */

import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../../src/users/entities/user.entity';
import { Role } from '../../../src/common/enums/role.enum';

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Daftar akun staf yang akan di-seed.
 * Sesuaikan dengan data nyata sebelum menjalankan di server.
 */
const STAFF_ACCOUNTS: Array<Partial<User>> = [
  // ── TU Fakultas ─────────────────────────────────────────────────────────────
  {
    email: 'tu.fti@ukri.ac.id',
    password: 'GantiPassword1!',
    namaLengkap: 'Staf TU Fakultas Teknik & Informatika',
    role: Role.TU,
    // PENTING: Ganti dengan UUID fakultas nyata dari tabel fakultas
    fakultasId: 'GANTI_DENGAN_UUID_FAKULTAS_FTI',
    nim: null,
  },
  {
    email: 'tu.fekon@ukri.ac.id',
    password: 'GantiPassword1!',
    namaLengkap: 'Staf TU Fakultas Ekonomi',
    role: Role.TU,
    fakultasId: 'GANTI_DENGAN_UUID_FAKULTAS_FEKON',
    nim: null,
  },
  // ── BAUM Staff ───────────────────────────────────────────────────────────────
  {
    email: 'baum.staf@ukri.ac.id',
    password: 'GantiPassword1!',
    namaLengkap: 'Staf BAUM UKRI',
    role: Role.BAUM_STAFF,
    fakultasId: null,
    nim: null,
  },
  // ── Kabag Umum ───────────────────────────────────────────────────────────────
  {
    email: 'kabag.umum@ukri.ac.id',
    password: 'GantiPassword1!',
    namaLengkap: 'Kepala Bagian Umum UKRI',
    role: Role.KABAG_UMUM,
    fakultasId: null,
    nim: null,
  },
  // ── Kabiro ───────────────────────────────────────────────────────────────────
  {
    email: 'kabiro.umum@ukri.ac.id',
    password: 'GantiPassword1!',
    namaLengkap: 'Kepala Biro Umum & Kepegawaian UKRI',
    role: Role.KABIRO,
    fakultasId: null,
    nim: null,
  },
];

async function seed(): Promise<void> {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'peminjaman_ukri',
    entities: [User],
    synchronize: false,
  });

  await dataSource.initialize();
  const usersRepo = dataSource.getRepository(User);

  console.log('🌱  Memulai seed akun staf...\n');

  for (const account of STAFF_ACCOUNTS) {
    const existing = await usersRepo.findOne({
      where: { email: account.email },
    });

    if (existing) {
      console.log(`⏭️   Di-skip (sudah ada): ${account.email}`);
      continue;
    }

    const hashed = await bcrypt.hash(account.password!, BCRYPT_SALT_ROUNDS);
    await usersRepo.save(
      usersRepo.create({ ...account, password: hashed }),
    );
    console.log(`✅  Dibuat [${account.role}]: ${account.email}`);
  }

  console.log('\n🎉  Seed selesai.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌  Seed gagal:', err);
  process.exit(1);
});
