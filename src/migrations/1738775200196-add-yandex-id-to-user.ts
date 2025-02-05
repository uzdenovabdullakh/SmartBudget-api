import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddYandexIdToUser1738775200196 implements MigrationInterface {
  name = 'AddYandexIdToUser1738775200196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "yandex_id" character varying(64)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "yandex_id"`);
  }
}
