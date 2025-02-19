import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderColumnToCategoryAndCategoryGroup1739912126938
  implements MigrationInterface
{
  name = 'AddOrderColumnToCategoryAndCategoryGroup1739912126938';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "category_groups" ADD "order" smallint`,
    );
    await queryRunner.query(`ALTER TABLE "categories" ADD "order" smallint`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "order"`);
    await queryRunner.query(
      `ALTER TABLE "category_groups" DROP COLUMN "order"`,
    );
  }
}
