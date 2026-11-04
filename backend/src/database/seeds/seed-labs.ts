import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Lab } from '../../labs/entities/lab.entity';

const LABS = [
  ['LAB-KOM-1', 'Lab Komputer 1'],
  ['LAB-KOM-2', 'Lab Komputer 2'],
  ['LAB-ELE-1', 'Lab Elektro 1'],
  ['LAB-ELE-2', 'Lab Elektro 2'],
  ['LAB-FIS-1', 'Lab Fisika'],
  ['LAB-GAM-1', 'Lab Gambar Mesin'],
  ['LAB-ERG-1', 'Lab Ergonomi'],
  ['LAB-ARS-1', 'Lab Studio Arsitek 1'],
  ['LAB-ARS-2', 'Lab Studio Arsitek 2'],
  ['LAB-BHS-1', 'Lab Bahasa'],
] as const;

async function seed(): Promise<void> {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'peminjaman_ukri',
    entities: [Lab],
    synchronize: false,
  });

  await dataSource.initialize();
  const repository = dataSource.getRepository(Lab);
  let created = 0;

  for (const [kode, nama] of LABS) {
    const existing = await repository.findOne({ where: { kode } });
    if (existing) continue;

    await repository.save(
      repository.create({ kode, nama, pengelola: null, isActive: true }),
    );
    created += 1;
  }

  await dataSource.destroy();
  console.log(`Seed laboratorium selesai. ${created} data baru dibuat.`);
}

seed().catch((error: unknown) => {
  console.error('Seed laboratorium gagal:', error);
  process.exit(1);
});
