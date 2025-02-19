import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveBudgetRelationToGroup1739558387920
  implements MigrationInterface
{
  name = 'MoveBudgetRelationToGroup1739558387920';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "fk_categories_to_budget"`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "budget_id"`);
    await queryRunner.query(
      `ALTER TABLE "category_groups" ADD "budget_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_groups" ADD CONSTRAINT "fk_category_group_to_budget" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "category_groups" DROP CONSTRAINT "fk_category_group_to_budget"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_groups" DROP COLUMN "budget_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "budget_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "fk_categories_to_budget" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
