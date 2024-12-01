import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoryGroup1733047419631 implements MigrationInterface {
  name = 'CreateCategoryGroup1733047419631';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "category_groups" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(128) NOT NULL, CONSTRAINT "PK_6968e9765dfc548603eea60877e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "type"`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "name" character varying(128) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "group_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "spent_amount" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "current_amount" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_9cb2a5ee5d6a59afa025f3b96d7" FOREIGN KEY ("group_id") REFERENCES "category_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_9cb2a5ee5d6a59afa025f3b96d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "current_amount" SET DEFAULT '0,00 ?'`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "spent_amount" SET DEFAULT '0,00 ?'`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "group_id"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "type" character varying(128) NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "category_groups"`);
  }
}
