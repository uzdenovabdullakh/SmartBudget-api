import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameActivityToSpent1740840258879 implements MigrationInterface {
  name = 'RenameActivityToSpent1740840258879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" RENAME COLUMN "activity" TO "spent"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" RENAME COLUMN "spent" TO "activity"`,
    );
  }
}
