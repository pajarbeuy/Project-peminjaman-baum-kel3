import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Faculty } from '../../faculties/entities/faculty.entity';

const FACULTIES: Array<Pick<Faculty, 'id' | 'nama'>> = [
  {
    id: 'a1000000-0000-4000-8000-000000000001',
    nama: 'Fakultas Fiksi',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000002',
    nama: 'Fakultas FTI',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000003',
    nama: 'FASOS',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000004',
    nama: 'FE',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000005',
    nama: 'PAPERTA',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000006',
    nama: 'FTSP',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000007',
    nama: 'FMIPA',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000008',
    nama: 'Fakultas Hukum',
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
    entities: [Faculty],
    synchronize: false,
  });

  await dataSource.initialize();
  const facultiesRepository = dataSource.getRepository(Faculty);

  console.log('Memulai seed fakultas...\n');

  for (const faculty of FACULTIES) {
    const existing = await facultiesRepository.findOne({
      where: [{ id: faculty.id }, { nama: faculty.nama }],
    });

    if (existing) {
      console.log(`Di-skip (sudah ada): ${faculty.nama}`);
      continue;
    }

    await facultiesRepository.save(facultiesRepository.create(faculty));
    console.log(`Dibuat: ${faculty.nama}`);
  }

  console.log('\nSeed fakultas selesai.');
  await dataSource.destroy();
}

seed().catch((error: unknown) => {
  console.error('Seed fakultas gagal:', error);
  process.exit(1);
});
