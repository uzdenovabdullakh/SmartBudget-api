import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeBudgetSettingDefaultValue1732785133128
  implements MigrationInterface
{
  name = 'ChangeBudgetSettingDefaultValue1732785133128';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "budgets" ALTER COLUMN "settings" SET DEFAULT '{"currency": "USD", "currencyPlacement": "before"}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "budgets" ALTER COLUMN "settings" SET DEFAULT '{}'`,
    );
  }
}
