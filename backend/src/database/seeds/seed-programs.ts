import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Faculty } from '../../faculties/entities/faculty.entity';
import { Program } from '../../programs/entities/program.entity';

const PROGRAMS = [
  ['Informatika', 'a1000000-0000-4000-8000-000000000001'],
  ['Sistem Informasi', 'a1000000-0000-4000-8000-000000000001'],
  ['Teknik Mesin', 'a1000000-0000-4000-8000-000000000002'],
  ['Teknik Industri', 'a1000000-0000-4000-8000-000000000002'],
  ['Teknik Elektro', 'a1000000-0000-4000-8000-000000000002'],
  ['Ilmu Komunikasi', 'a1000000-0000-4000-8000-000000000003'],
  ['Sastra Inggris', 'a1000000-0000-4000-8000-000000000003'],
  ['Manajemen', 'a1000000-0000-4000-8000-000000000004'],
  ['Agrotek', 'a1000000-0000-4000-8000-000000000005'],
  ['Agribisnis', 'a1000000-0000-4000-8000-000000000005'],
  ['Arsitektur', 'a1000000-0000-4000-8000-000000000006'],
  ['Teknik Lingkungan', 'a1000000-0000-4000-8000-000000000006'],
  ['Matematika', 'a1000000-0000-4000-8000-000000000007'],
  ['Fisika', 'a1000000-0000-4000-8000-000000000007'],
  ['Hukum', 'a1000000-0000-4000-8000-000000000008'],
] as const;

async function seed(): Promise<void> {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'peminjaman_ukri',
    entities: [Faculty, Program],
    synchronize: false,
  });

  await dataSource.initialize();
  const repository = dataSource.getRepository(Program);

  for (const [nama, fakultasId] of PROGRAMS) {
    const existing = await repository.findOne({ where: { nama } });
    if (existing) {
      console.log(`Di-skip (sudah ada): ${nama}`);
      continue;
    }
    await repository.save(repository.create({ nama, fakultasId }));
    console.log(`Dibuat: ${nama}`);
  }

  await dataSource.destroy();
  console.log('Seed program studi selesai.');
}

seed().catch((error: unknown) => {
  console.error('Seed program studi gagal:', error);
  process.exit(1);
});
