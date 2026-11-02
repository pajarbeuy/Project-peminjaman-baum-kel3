import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';
import { Faculty } from './src/faculties/entities/faculty.entity';
import { Program } from './src/programs/entities/program.entity';
import { Room } from './src/rooms/entities/room.entity';
import { Lab } from './src/labs/entities/lab.entity';
import { Item } from './src/items/entities/item.entity';
import { LoanRequest } from './src/loan-requests/entities/loan-request.entity';
import { LoanRequestItem } from './src/loan-requests/entities/loan-request-item.entity';
import { LoanDocument } from './src/loan-requests/entities/loan-document.entity';

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
  entities: [User, Faculty, Program, Room, Lab, Item, LoanRequest, LoanRequestItem, LoanDocument],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
