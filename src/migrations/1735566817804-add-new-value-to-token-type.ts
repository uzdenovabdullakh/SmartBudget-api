import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewValueToTokenType1735566817804 implements MigrationInterface {
  name = 'AddNewValueToTokenType1735566817804';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."enum_tokens_token_type" RENAME TO "enum_tokens_token_type_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enum_tokens_token_type" AS ENUM('reset_password', 'activate_account', 'refresh_token', 'restore_account')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" ALTER COLUMN "token_type" TYPE "public"."enum_tokens_token_type" USING "token_type"::"text"::"public"."enum_tokens_token_type"`,
    );
    await queryRunner.query(`DROP TYPE "public"."enum_tokens_token_type_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."enum_tokens_token_type_old" AS ENUM('activate_account', 'refresh_token', 'reset_password')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" ALTER COLUMN "token_type" TYPE "public"."enum_tokens_token_type_old" USING "token_type"::"text"::"public"."enum_tokens_token_type_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."enum_tokens_token_type"`);
    await queryRunner.query(
      `ALTER TYPE "public"."enum_tokens_token_type_old" RENAME TO "enum_tokens_token_type"`,
    );
  }
}
