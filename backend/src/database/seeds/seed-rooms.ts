import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';

async function seed(): Promise<void> {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'peminjaman_ukri',
    entities: [Room],
    synchronize: false,
  });

  await dataSource.initialize();
  const repository = dataSource.getRepository(Room);
  let created = 0;

  for (const lantai of [6, 7]) {
    for (let nomor = 1; nomor <= 14; nomor += 1) {
      const kode = `${lantai}.${nomor}`;
      const existing = await repository.findOne({ where: { kode } });
      if (existing) continue;

      await repository.save(repository.create({ kode, lantai, nomor, isActive: true }));
      created += 1;
    }
  }

  await dataSource.destroy();
  console.log(`Seed ruang selesai. ${created} data baru dibuat.`);
}

seed().catch((error: unknown) => {
  console.error('Seed ruang gagal:', error);
  process.exit(1);
});
