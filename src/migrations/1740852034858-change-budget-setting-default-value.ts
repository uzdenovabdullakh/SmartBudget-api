import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChnageBudgetSettingsDefaultValue1740852034858
  implements MigrationInterface
{
  name = 'ChnageBudgetSettingsDefaultValue1740852034858';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "budgets" ALTER COLUMN "settings" SET DEFAULT '{"currency": "₽", "currencyPlacement": "before"}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "budgets" ALTER COLUMN "settings" SET DEFAULT '{"currency": "$", "currencyPlacement": "before"}'`,
    );
  }
}
