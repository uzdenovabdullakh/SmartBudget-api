import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpirationTimeColumnToTokens1732789060924
  implements MigrationInterface
{
  name = 'AddExpirationTimeColumnToTokens1732789060924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD "expiration_time" TIMESTAMP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tokens" DROP COLUMN "expiration_time"`,
    );
  }
}
