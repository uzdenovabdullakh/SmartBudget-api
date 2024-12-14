import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeToCommonEnum1734179827461 implements MigrationInterface {
  name = 'ChangeToCommonEnum1734179827461';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "current_amount" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."enum_goals_period" RENAME TO "enum_goals_period_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enum_period" AS ENUM('daily', 'weekly', 'monthly', 'yearly', 'none')`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "period" TYPE "public"."enum_period" USING "period"::"text"::"public"."enum_period"`,
    );
    await queryRunner.query(`DROP TYPE "public"."enum_goals_period_old"`);
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "spent_amount" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."enum_category_limit_reset_period" RENAME TO "enum_category_limit_reset_period_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enum_period" AS ENUM('daily', 'weekly', 'monthly', 'yearly', 'none')`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "limit_reset_period" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "limit_reset_period" TYPE "public"."enum_period" USING "limit_reset_period"::"text"::"public"."enum_period"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "limit_reset_period" SET DEFAULT 'none'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."enum_category_limit_reset_period_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."enum_category_limit_reset_period_old" AS ENUM('daily', 'weekly', 'monthly', 'yearly', 'none')`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "limit_reset_period" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "limit_reset_period" TYPE "public"."enum_category_limit_reset_period_old" USING "limit_reset_period"::"text"::"public"."enum_category_limit_reset_period_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "limit_reset_period" SET DEFAULT 'none'`,
    );
    await queryRunner.query(`DROP TYPE "public"."enum_period"`);
    await queryRunner.query(
      `ALTER TYPE "public"."enum_category_limit_reset_period_old" RENAME TO "enum_category_limit_reset_period"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "spent_amount" SET DEFAULT '0,00 ?'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enum_goals_period_old" AS ENUM('weekly', 'monthly', 'yearly')`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "period" TYPE "public"."enum_goals_period_old" USING "period"::"text"::"public"."enum_goals_period_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."enum_period"`);
    await queryRunner.query(
      `ALTER TYPE "public"."enum_goals_period_old" RENAME TO "enum_goals_period"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "current_amount" SET DEFAULT '0,00 ?'`,
    );
  }
}
