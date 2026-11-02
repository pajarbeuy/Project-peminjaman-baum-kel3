import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateItemsAndLoanRequestsTables1729607400000 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.createTable(new Table({ name: 'items', columns: [
      { name: 'id', type: 'varchar', length: '36', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
      { name: 'kode', type: 'varchar', length: '50', isUnique: true }, { name: 'nama', type: 'varchar', length: '255' },
      { name: 'kategori', type: 'varchar', length: '100' }, { name: 'totalStok', type: 'int', isNullable: false },
      { name: 'jumlahDipinjam', type: 'int', default: 0 }, { name: 'isActive', type: 'tinyint', length: '1', default: 1 },
    ] }), true);
    await q.createTable(new Table({ name: 'loan_requests', columns: [
      { name: 'id', type: 'varchar', length: '36', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
      { name: 'userId', type: 'varchar', length: '36' }, { name: 'tanggalMulai', type: 'date' },
      { name: 'durasiHari', type: 'int' }, { name: 'keperluan', type: 'varchar', length: '1000' },
      { name: 'unitKerja', type: 'varchar', length: '255' }, { name: 'penanggungJawab', type: 'varchar', length: '255' },
      { name: 'kontakPeminjam', type: 'varchar', length: '50' }, { name: 'roomId', type: 'varchar', length: '36', isNullable: true },
      { name: 'labId', type: 'varchar', length: '36', isNullable: true },
      { name: 'status', type: 'enum', enum: ['DRAFT','DIAJUKAN','DIVERIFIKASI_TU','DIPROSES_BAUM','DISETUJUI','DIKELUARKAN','SELESAI','DITOLAK'], default: "'DRAFT'" },
      { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
    ], indices: [{ name: 'IDX_loan_requests_user', columnNames: ['userId'] }, { name: 'IDX_loan_requests_schedule', columnNames: ['roomId','labId','tanggalMulai'] }] }), true);
    await q.createTable(new Table({ name: 'loan_request_items', columns: [
      { name: 'id', type: 'varchar', length: '36', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
      { name: 'loanRequestId', type: 'varchar', length: '36' }, { name: 'itemId', type: 'varchar', length: '36' }, { name: 'jumlah', type: 'int' },
    ], indices: [{ name: 'UQ_loan_request_item', columnNames: ['loanRequestId','itemId'], isUnique: true }], foreignKeys: [
      { name: 'FK_request_items_request', columnNames: ['loanRequestId'], referencedTableName: 'loan_requests', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
      { name: 'FK_request_items_item', columnNames: ['itemId'], referencedTableName: 'items', referencedColumnNames: ['id'], onDelete: 'RESTRICT' },
    ] }), true);
  }
  public async down(q: QueryRunner): Promise<void> { await q.dropTable('loan_request_items'); await q.dropTable('loan_requests'); await q.dropTable('items'); }
}
