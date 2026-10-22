import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';

/**
 * DataSource untuk TypeORM CLI.
 * Dijalankan via: npm run migration:run / migration:revert / migration:generate
 *
 * tsx menangani TypeScript NodeNext/ESM tanpa konflik CJS require().
 */
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'peminjaman_ukri',
  entities: [User],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
