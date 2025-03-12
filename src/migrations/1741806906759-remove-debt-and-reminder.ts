import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDebtAndReminder1741806906759 implements MigrationInterface {
  name = 'RemoveDebtAndReminder1741806906759';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reminders" DROP CONSTRAINT "FK_reminder_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminders" DROP CONSTRAINT "FK_reminder_debt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminders" DROP CONSTRAINT "FK_reminder_goal"`,
    );
    await queryRunner.query(`DROP TABLE "reminders"`);
    await queryRunner.query(`DROP TYPE "public"."enum_reminder_entity_type"`);
    await queryRunner.query(
      `ALTER TABLE "debts" DROP CONSTRAINT "fk_debts_to_budget"`,
    );
    await queryRunner.query(`DROP TABLE "debts"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "debts" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "creditor" character varying(128) NOT NULL, "amount" money NOT NULL, "due_date" TIMESTAMP NOT NULL, "budget_id" uuid NOT NULL, CONSTRAINT "PK_4bd9f54aab9e59628a3a2657fa1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "debts" DROP CONSTRAINT "fk_debts_to_budget"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enum_reminder_entity_type" AS ENUM('goal', 'debt', 'category_limit')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reminders" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(128) NOT NULL, "entity_type" "public"."enum_reminder_entity_type" NOT NULL, "entity_id" uuid, CONSTRAINT "chk_reminder_entity_id" CHECK (entity_id IS NOT NULL), CONSTRAINT "PK_38715fec7f634b72c6cf7ea4893" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminders" ADD CONSTRAINT "FK_reminder_goal" FOREIGN KEY ("entity_id") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminders" ADD CONSTRAINT "FK_reminder_debt" FOREIGN KEY ("entity_id") REFERENCES "debts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminders" ADD CONSTRAINT "FK_reminder_category" FOREIGN KEY ("entity_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
