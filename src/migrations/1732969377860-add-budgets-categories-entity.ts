import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBudgetsCategoriesEntity1732969377860
  implements MigrationInterface
{
  name = 'AddBudgetsCategoriesEntity1732969377860';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "category_spending" DROP CONSTRAINT "fk_category_spending_to_spending"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "fk_category_to_goal"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" RENAME COLUMN "category_id" TO "budget_category_id"`,
    );
    await queryRunner.query(
      `CREATE TABLE "budgets_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "limit_amount" money, "limit_reset_period" "public"."enum_category_limit_reset_period" NOT NULL DEFAULT 'none', "goal_id" uuid, "category_id" uuid, "budget_id" uuid, CONSTRAINT "REL_309427379340afa03f0f3c67d6" UNIQUE ("goal_id"), CONSTRAINT "PK_249274acd61d6b37360a83a95aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "limit_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "limit_reset_period"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "REL_efc7cf13cd2c4d4ff492bd3dfa"`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "goal_id"`);
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "token"`);
    await queryRunner.query(`ALTER TABLE "tokens" ADD "token" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "spent_amount" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "current_amount" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ADD CONSTRAINT "fk_category_spending_to_budget_category" FOREIGN KEY ("budget_category_id") REFERENCES "budgets_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets_categories" ADD CONSTRAINT "fk_budgets_categories_to_goal" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets_categories" ADD CONSTRAINT "fk_budgets_categories_to_categories" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets_categories" ADD CONSTRAINT "fk_budgets_categories_to_budgets" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "budgets_categories" DROP CONSTRAINT "fk_budgets_categories_to_budgets"`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets_categories" DROP CONSTRAINT "fk_budgets_categories_to_categories"`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets_categories" DROP CONSTRAINT "fk_budgets_categories_to_goal"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" DROP CONSTRAINT "fk_category_spending_to_budget_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "current_amount" SET DEFAULT '0,00 ?'`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "spent_amount" SET DEFAULT '0,00 ?'`,
    );
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "token"`);
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD "token" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "categories" ADD "goal_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "REL_efc7cf13cd2c4d4ff492bd3dfa" UNIQUE ("goal_id")`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enum_category_limit_reset_period" AS ENUM('daily', 'weekly', 'monthly', 'none')`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "limit_reset_period" "public"."enum_category_limit_reset_period" NOT NULL DEFAULT 'none'`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "limit_amount" money`,
    );
    await queryRunner.query(`DROP TABLE "budgets_categories"`);
    await queryRunner.query(
      `ALTER TABLE "category_spending" RENAME COLUMN "budget_category_id" TO "category_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "fk_category_to_goal" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ADD CONSTRAINT "fk_category_spending_to_spending" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
