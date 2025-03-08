import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCategoryFromGoal1741119096309 implements MigrationInterface {
  name = 'RemoveCategoryFromGoal1741119096309';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "fk_category_to_goal"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "REL_efc7cf13cd2c4d4ff492bd3dfa"`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "goal_id"`);
    await queryRunner.query(`ALTER TABLE "goals" DROP COLUMN "period"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "goals" ADD "period" "public"."enum_period" NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "categories" ADD "goal_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "REL_efc7cf13cd2c4d4ff492bd3dfa" UNIQUE ("goal_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "fk_category_to_goal" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
