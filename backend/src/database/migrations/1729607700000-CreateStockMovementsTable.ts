import { MigrationInterface, QueryRunner, Table } from 'typeorm';
export class CreateStockMovementsTable1729607700000 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> { await q.createTable(new Table({ name: 'stock_movements', columns: [
    { name: 'id', type: 'varchar', length: '36', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' }, { name: 'itemId', type: 'varchar', length: '36' }, { name: 'loanRequestId', type: 'varchar', length: '36' }, { name: 'jenis', type: 'enum', enum: ['KELUAR','KEMBALI'] }, { name: 'jumlah', type: 'int' }, { name: 'actorId', type: 'varchar', length: '36' }, { name: 'kondisi', type: 'varchar', length: '255', isNullable: true }, { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
  ], indices: [{ name: 'IDX_stock_movement_request_item_type', columnNames: ['loanRequestId','itemId','jenis'], isUnique: true }], foreignKeys: [{ name: 'FK_movement_item', columnNames: ['itemId'], referencedTableName: 'items', referencedColumnNames: ['id'], onDelete: 'RESTRICT' }, { name: 'FK_movement_request', columnNames: ['loanRequestId'], referencedTableName: 'loan_requests', referencedColumnNames: ['id'], onDelete: 'RESTRICT' }] }), true); }
  public async down(q: QueryRunner): Promise<void> { await q.dropTable('stock_movements'); }
}
