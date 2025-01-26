import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAmountToBankEntity1737571597847 implements MigrationInterface {
  name = 'AddAmountToBankEntity1737571597847';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bank" ADD "amount" numeric(10,2) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bank" DROP COLUMN "amount"`);
  }
}
