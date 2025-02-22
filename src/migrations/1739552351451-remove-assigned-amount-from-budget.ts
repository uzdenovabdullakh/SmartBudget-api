import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAssignedAmountFromBudget1739552351451
  implements MigrationInterface
{
  name = 'RemoveAssignedAmountFromBudget1739552351451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "budgets" DROP COLUMN "assigned_amount"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "budgets" ADD "assigned_amount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
  }
}
