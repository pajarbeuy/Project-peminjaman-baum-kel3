import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateLabsTable1729607300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'labs',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'kode', type: 'varchar', length: '30', isUnique: true },
          { name: 'nama', type: 'varchar', length: '255' },
          { name: 'pengelola', type: 'varchar', length: '255', isNullable: true },
          { name: 'isActive', type: 'tinyint', length: '1', default: 1 },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('labs');
  }
}
