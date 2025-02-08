import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeleteToAccount1739039355280
  implements MigrationInterface
{
  name = 'AddCascadeDeleteToAccount1739039355280';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "accounts" DROP CONSTRAINT "fk_account_to_bank";
      ALTER TABLE "accounts" DROP CONSTRAINT "fk_account_to_unlinked_account";
      
      ALTER TABLE "accounts"
      ADD CONSTRAINT "fk_account_to_bank"
      FOREIGN KEY (bank_id) REFERENCES "bank"(id)
      ON DELETE CASCADE;
      
      ALTER TABLE "accounts"
      ADD CONSTRAINT "fk_account_to_unlinked_account"
      FOREIGN KEY (unlinked_account_id) REFERENCES "unlinked_account"(id)
      ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "accounts" DROP CONSTRAINT "fk_account_to_bank";
      ALTER TABLE "accounts" DROP CONSTRAINT "fk_account_to_unlinked_account";
      
      ALTER TABLE "accounts"
      ADD CONSTRAINT "fk_account_to_bank"
      FOREIGN KEY (bank_id) REFERENCES "bank"(id)
      ON DELETE SET NULL;
      
      ALTER TABLE "accounts"
      ADD CONSTRAINT "fk_account_to_unlinked_account"
      FOREIGN KEY (unlinked_account_id) REFERENCES "unlinked_account"(id)
      ON DELETE SET NULL;
    `);
  }
}
