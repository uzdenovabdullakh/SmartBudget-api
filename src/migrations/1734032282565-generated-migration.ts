import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1734032282565 implements MigrationInterface {
  name = 'GeneratedMigration1734032282565';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "current_amount" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "spent_amount" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."enum_category_limit_reset_period" RENAME TO "enum_category_limit_reset_period_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enum_category_limit_reset_period" AS ENUM('daily', 'weekly', 'monthly', 'yearly', 'none')`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "limit_reset_period" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "limit_reset_period" TYPE "public"."enum_category_limit_reset_period" USING "limit_reset_period"::"text"::"public"."enum_category_limit_reset_period"`,
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
      `CREATE TYPE "public"."enum_category_limit_reset_period_old" AS ENUM('daily', 'weekly', 'monthly', 'none')`,
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
    await queryRunner.query(
      `DROP TYPE "public"."enum_category_limit_reset_period"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."enum_category_limit_reset_period_old" RENAME TO "enum_category_limit_reset_period"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "spent_amount" SET DEFAULT '0,00 ?'`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "current_amount" SET DEFAULT '0,00 ?'`,
    );
  }
}
