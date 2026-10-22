import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migration: Membuat tabel `users`.
 *
 * Catatan:
 * - `fakultasId` disimpan sebagai VARCHAR(36) tanpa FK sementara.
 *   FK ke tabel `fakultas` akan ditambahkan pada migration berikutnya.
 * - `password` dan `hashedRefreshToken` TIDAK dikembalikan di query biasa
 *   (diatur di entity dengan select: false).
 * - Gunakan: npx typeorm-ts-node-commonjs migration:run -d data-source.ts
 */
export class CreateUsersTable1729606800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'bcrypt hash. TIDAK boleh dikembalikan ke response API.',
          },
          {
            name: 'namaLengkap',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['MAHASISWA', 'TU', 'BAUM_STAFF', 'KABAG_UMUM', 'KABIRO'],
            isNullable: false,
          },
          {
            name: 'nim',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Wajib untuk Mahasiswa (BR-02). NULL untuk role lain.',
          },
          {
            name: 'fakultasId',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment:
              'Scope fakultas untuk TU (BR-03) dan wajib untuk Mahasiswa. FK ke tabel fakultas ditambahkan di migration berikutnya.',
          },
          {
            name: 'hashedRefreshToken',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'bcrypt hash dari refresh token. NULL setelah logout.',
          },
          {
            name: 'isActive',
            type: 'tinyint',
            length: '1',
            default: 1,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_users_email',
            columnNames: ['email'],
            isUnique: true,
          },
          {
            name: 'IDX_users_role',
            columnNames: ['role'],
          },
          {
            name: 'IDX_users_fakultasId',
            columnNames: ['fakultasId'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
