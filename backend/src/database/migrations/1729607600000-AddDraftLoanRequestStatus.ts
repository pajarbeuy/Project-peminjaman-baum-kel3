import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDraftLoanRequestStatus1729607600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `loan_requests` MODIFY `status` enum ('DRAFT','DIAJUKAN','DIVERIFIKASI_TU','DIPROSES_BAUM','DISETUJUI','DIKELUARKAN','SELESAI','DITOLAK') NOT NULL DEFAULT 'DRAFT'");
    await queryRunner.query("ALTER TABLE `loan_requests` ADD `rejectionReason` varchar(1000) NULL");
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `loan_requests` MODIFY `status` enum ('DIAJUKAN','DIVERIFIKASI_TU','DIPROSES_BAUM','DISETUJUI','DIKELUARKAN','SELESAI','DITOLAK') NOT NULL DEFAULT 'DIAJUKAN'");
    await queryRunner.query("ALTER TABLE `loan_requests` DROP COLUMN `rejectionReason`");
  }
}
