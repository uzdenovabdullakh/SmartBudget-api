import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeCategoryStructure1733045141548
  implements MigrationInterface
{
  name = 'ChangeCategoryStructure1733045141548';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "category_spending" DROP CONSTRAINT "fk_category_spending_to_spending"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "limit_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "limit_reset_period"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ADD "limit_amount" money`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ADD "limit_reset_period" "public"."enum_category_limit_reset_period" NOT NULL DEFAULT 'none'`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "budget_id" uuid NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "token"`);
    await queryRunner.query(`ALTER TABLE "tokens" ADD "token" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "spent_amount" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "current_amount" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ADD CONSTRAINT "fk_category_spending_to_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "fk_categories_to_budget" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "fk_categories_to_budget"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" DROP CONSTRAINT "fk_category_spending_to_category"`,
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
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "budget_id"`);
    await queryRunner.query(
      `ALTER TABLE "category_spending" DROP COLUMN "limit_reset_period"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" DROP COLUMN "limit_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "limit_reset_period" "public"."enum_category_limit_reset_period" NOT NULL DEFAULT 'none'`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "limit_amount" money`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ADD CONSTRAINT "fk_category_spending_to_spending" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
