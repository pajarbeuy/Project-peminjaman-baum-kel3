import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateLoanDocumentsTable1729607500000 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.createTable(new Table({ name: 'loan_documents', columns: [
      { name: 'id', type: 'varchar', length: '36', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
      { name: 'loanRequestId', type: 'varchar', length: '36' },
      { name: 'jenis', type: 'enum', enum: ['SURAT_BIDANG_3','KTM','BIODATA_ORMAWA'] },
      { name: 'namaAsli', type: 'varchar', length: '255' }, { name: 'mimeType', type: 'varchar', length: '100' },
      { name: 'ukuran', type: 'int' }, { name: 'storagePath', type: 'varchar', length: '500' },
      { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
    ], foreignKeys: [{ name: 'FK_documents_request', columnNames: ['loanRequestId'], referencedTableName: 'loan_requests', referencedColumnNames: ['id'], onDelete: 'CASCADE' }] }), true);
  }
  public async down(q: QueryRunner): Promise<void> { await q.dropTable('loan_documents'); }
}
