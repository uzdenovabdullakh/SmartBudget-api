import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChnageMoneyToNumeric1736796195858 implements MigrationInterface {
  name = 'ChnageMoneyToNumeric1736796195858';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "unlinked_account" ALTER COLUMN "amount" TYPE numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "debts" ALTER COLUMN "amount" TYPE numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "target_amount" TYPE numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "current_amount" TYPE numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "spent_amount" TYPE numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "limit_amount" TYPE numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE money`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "limit_amount" TYPE money`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "spent_amount" TYPE money`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "current_amount" TYPE money`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "target_amount" TYPE money`,
    );
    await queryRunner.query(
      `ALTER TABLE "debts" ALTER COLUMN "amount" TYPE money`,
    );
    await queryRunner.query(
      `ALTER TABLE "unlinked_account" ALTER COLUMN "amount" TYPE money`,
    );
  }
}
