import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddProgramToUsersTable1729607100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({ name: 'programId', type: 'varchar', length: '36', isNullable: true }),
    );
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'FK_users_program',
        columnNames: ['programId'],
        referencedTableName: 'programs',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');
    const foreignKey = table?.foreignKeys.find((key) => key.name === 'FK_users_program');
    if (foreignKey) await queryRunner.dropForeignKey('users', foreignKey);
    await queryRunner.dropColumn('users', 'programId');
  }
}
