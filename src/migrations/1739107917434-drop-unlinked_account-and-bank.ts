import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUnlinkedAccountAndBank1739107917434
  implements MigrationInterface
{
  name = 'DropUnlinkedAccountAndBank1739107917434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "fk_account_to_unlinked_account"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "fk_account_to_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "ch_account_bank_or_unlinked"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "REL_82bf2a76317b7b4506fa5db0e4"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "bank_id"`);
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "REL_cc4e5a8eb76926c5be8731b294"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "unlinked_account_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "name" character varying(64) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "amount" numeric(10,2) NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE unlinked_account;`);
    await queryRunner.query(`DROP TABLE bank;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      CREATE TABLE bank
      (
        created_at    timestamp DEFAULT ('now'::text)::timestamp(6) WITH TIME ZONE NOT NULL,
        updated_at    timestamp DEFAULT ('now'::text)::timestamp(6) WITH TIME ZONE NOT NULL,
        deleted_at    timestamp,
        id            uuid      DEFAULT uuid_generate_v4()                         NOT NULL
            CONSTRAINT "PK_7651eaf705126155142947926e8"
                PRIMARY KEY,
        name          varchar(128)                                                 NOT NULL,
        access_token  text                                                         NOT NULL,
        refresh_token text                                                         NOT NULL,
        amount        numeric(10, 2)                                               NOT NULL
      );
      `,
    );
    await queryRunner.query(
      `
      CREATE TABLE unlinked_account
      (
        created_at timestamp DEFAULT ('now'::text)::timestamp(6) WITH TIME ZONE NOT NULL,
        updated_at timestamp DEFAULT ('now'::text)::timestamp(6) WITH TIME ZONE NOT NULL,
        deleted_at timestamp,
        id         uuid      DEFAULT uuid_generate_v4()                         NOT NULL
            CONSTRAINT "PK_ed940b04db72e2cb2bdb0ae3e81"
                PRIMARY KEY,
        name       varchar(64)                                                  NOT NULL,
        amount     numeric(10, 2)                                               NOT NULL
      );
      `,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "amount"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "unlinked_account_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "REL_cc4e5a8eb76926c5be8731b294" UNIQUE ("unlinked_account_id")`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" ADD "bank_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "REL_82bf2a76317b7b4506fa5db0e4" UNIQUE ("bank_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "ch_account_bank_or_unlinked" CHECK ((((bank_id IS NULL) AND (unlinked_account_id IS NOT NULL)) OR ((bank_id IS NOT NULL) AND (unlinked_account_id IS NULL))))`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "fk_account_to_bank" FOREIGN KEY ("bank_id") REFERENCES "bank"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "fk_account_to_unlinked_account" FOREIGN KEY ("unlinked_account_id") REFERENCES "unlinked_account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
