import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveTypeToAccount1737628100415 implements MigrationInterface {
  name = 'MoveTypeToAccount1737628100415';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "unlinked_account" DROP COLUMN "type"`,
    );
    await queryRunner.query(`DROP TYPE "public"."enum_unlinked_account_type"`);
    await queryRunner.query(
      `CREATE TYPE "public"."enum_account_type" AS ENUM('cash', 'card', 'savings', 'bank')`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "type" "public"."enum_account_type" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."enum_account_type"`);
    await queryRunner.query(
      `CREATE TYPE "public"."enum_unlinked_account_type" AS ENUM('card', 'cash', 'savings')`,
    );
    await queryRunner.query(
      `ALTER TABLE "unlinked_account" ADD "type" "public"."enum_unlinked_account_type" NOT NULL`,
    );
  }
}
