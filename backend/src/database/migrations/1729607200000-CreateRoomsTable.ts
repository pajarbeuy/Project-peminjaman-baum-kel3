import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRoomsTable1729607200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rooms',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'kode', type: 'varchar', length: '20', isUnique: true },
          { name: 'lantai', type: 'tinyint', isNullable: false },
          { name: 'nomor', type: 'tinyint', isNullable: false },
          { name: 'isActive', type: 'tinyint', length: '1', default: 1 },
        ],
        indices: [
          { name: 'IDX_rooms_lantai_nomor', columnNames: ['lantai', 'nomor'] },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('rooms');
  }
}
