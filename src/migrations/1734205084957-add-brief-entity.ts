import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBriefEntity1734205084957 implements MigrationInterface {
  name = 'AddBriefEntity1734205084957';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "brief" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "briefAnswers" jsonb NOT NULL DEFAULT '{}', "user_id" uuid NOT NULL, CONSTRAINT "REL_951d6d7614ccec75dac51cecb8" UNIQUE ("user_id"), CONSTRAINT "PK_127657d07cd4734cff26bad2f02" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "brief" ADD CONSTRAINT "fk_brief_to_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "brief" DROP CONSTRAINT "fk_brief_to_user"`,
    );
    await queryRunner.query(`DROP TABLE "brief"`);
  }
}
