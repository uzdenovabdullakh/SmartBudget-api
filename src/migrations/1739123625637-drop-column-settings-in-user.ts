import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropColumnSettingInUser1739123625637
  implements MigrationInterface
{
  name = 'DropColumnSettingInUser1739123625637';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "settings"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "settings" jsonb NOT NULL DEFAULT '{}'`,
    );
  }
}
