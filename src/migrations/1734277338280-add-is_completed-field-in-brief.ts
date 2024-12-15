import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsCompletedFieldInBrief1734277338280
  implements MigrationInterface
{
  name = 'AddIsCompletedFieldInBrief1734277338280';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "brief" DROP COLUMN "briefAnswers"`);
    await queryRunner.query(
      `ALTER TABLE "brief" ADD "brief_answers" jsonb NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "brief" ADD "is_completed" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "brief" DROP COLUMN "is_completed"`);
    await queryRunner.query(`ALTER TABLE "brief" DROP COLUMN "brief_answers"`);
    await queryRunner.query(
      `ALTER TABLE "brief" ADD "briefAnswers" jsonb NOT NULL DEFAULT '{}'`,
    );
  }
}
