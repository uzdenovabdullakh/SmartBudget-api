import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOutflowAndInflow1739536851008 implements MigrationInterface {
  name = 'AddOutflowAndInflow1739536851008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "amount"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."enum_transactions_type"`);
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "inflow" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "outflow" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "current_amount" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ALTER COLUMN "spent_amount" SET DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "outflow"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "inflow"`);
    await queryRunner.query(
      `CREATE TYPE "public"."enum_transactions_type" AS ENUM('expense', 'income')`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "type" "public"."enum_transactions_type" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "amount" numeric(10,2) NOT NULL`,
    );
  }
}
