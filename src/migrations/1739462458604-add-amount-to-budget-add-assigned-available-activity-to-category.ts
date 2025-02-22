import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAmountToBudgetAddAssignedAvailableActivityToCategory1739462458604
  implements MigrationInterface
{
  name = 'AddAmountToBudgetAddAssignedAvailableActivityToCategory1739462458604';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "assigned" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "activity" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "available" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" ADD "assigned_amount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "budgets" DROP COLUMN "assigned_amount"`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "available"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "activity"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "assigned"`);
  }
}
