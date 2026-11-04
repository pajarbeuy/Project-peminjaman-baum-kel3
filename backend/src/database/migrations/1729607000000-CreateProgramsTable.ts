import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProgramsTable1729607000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'programs',
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
            name: 'nama',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'fakultasId',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            name: 'FK_programs_faculty',
            columnNames: ['fakultasId'],
            referencedTableName: 'faculties',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
        ],
        indices: [{ name: 'IDX_programs_fakultasId', columnNames: ['fakultasId'] }],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('programs');
  }
}
