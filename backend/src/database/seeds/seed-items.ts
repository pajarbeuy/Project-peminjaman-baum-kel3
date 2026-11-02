import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Item } from '../../items/entities/item.entity';

const ITEMS = [
  ['BRG-KUR-001', 'Kursi Kuliah', 'Furnitur', 100],
  ['BRG-MIC-001', 'Mikrofon', 'Elektronik', 10],
  ['BRG-PRO-001', 'Proyektor', 'Elektronik', 8],
] as const;

async function seed(): Promise<void> {
  const dataSource = new DataSource({ type: 'mysql', host: process.env.DB_HOST ?? '127.0.0.1', port: Number(process.env.DB_PORT ?? 3306), username: process.env.DB_USERNAME ?? 'root', password: process.env.DB_PASSWORD ?? '', database: process.env.DB_DATABASE ?? 'peminjaman_ukri', entities: [Item], synchronize: false });
  await dataSource.initialize(); const repository = dataSource.getRepository(Item); let created = 0;
  for (const [kode, nama, kategori, totalStok] of ITEMS) { if (await repository.findOne({ where: { kode } })) continue; await repository.save(repository.create({ kode, nama, kategori, totalStok, jumlahDipinjam: 0, isActive: true })); created += 1; }
  await dataSource.destroy(); console.log(`Seed barang selesai. ${created} data baru dibuat.`);
}
seed().catch((error: unknown) => { console.error('Seed barang gagal:', error); process.exit(1); });
