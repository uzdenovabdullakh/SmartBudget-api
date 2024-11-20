import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDatabase1732127406542 implements MigrationInterface {
  name = 'InitDatabase1732127406542';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."enum_tokens_token_type" AS ENUM('reset_password', 'activate_account', 'refresh_token')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tokens" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "token_type" "public"."enum_tokens_token_type" NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bank" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(128) NOT NULL, "access_token" text NOT NULL, "refresh_token" text NOT NULL, CONSTRAINT "PK_7651eaf705126155142947926e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enum_unlinked_account_type" AS ENUM('cash', 'card', 'savings')`,
    );
    await queryRunner.query(
      `CREATE TABLE "unlinked_account" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(64) NOT NULL, "amount" money NOT NULL, "type" "public"."enum_unlinked_account_type" NOT NULL, CONSTRAINT "PK_ed940b04db72e2cb2bdb0ae3e81" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "debts" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "creditor" character varying(128) NOT NULL, "amount" money NOT NULL, "due_date" TIMESTAMP NOT NULL, "budget_id" uuid NOT NULL, CONSTRAINT "PK_4bd9f54aab9e59628a3a2657fa1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enum_reminder_entity_type" AS ENUM('goal', 'debt', 'category_limit')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reminders" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(128) NOT NULL, "entity_type" "public"."enum_reminder_entity_type" NOT NULL, "entity_id" uuid, CONSTRAINT "chk_reminder_entity_id" CHECK (entity_id IS NOT NULL), CONSTRAINT "PK_38715fec7f634b72c6cf7ea4893" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enum_goals_period" AS ENUM('weekly', 'monthly', 'yearly')`,
    );
    await queryRunner.query(
      `CREATE TABLE "goals" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(64), "target_amount" money NOT NULL, "current_amount" money NOT NULL DEFAULT '0', "achieve_date" TIMESTAMP NOT NULL, "period" "public"."enum_goals_period" NOT NULL, "budget_id" uuid NOT NULL, CONSTRAINT "PK_26e17b251afab35580dff769223" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category_spending" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "spent_amount" money NOT NULL DEFAULT '0', "period_start" TIMESTAMP NOT NULL, "period_end" TIMESTAMP NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "uk_category_period" UNIQUE ("category_id", "period_start", "period_end"), CONSTRAINT "REL_1be4233be3afae6e70224b66ab" UNIQUE ("category_id"), CONSTRAINT "PK_b3f74d0bd9dd7503fb0d3ce37e1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enum_category_limit_reset_period" AS ENUM('daily', 'weekly', 'monthly', 'none')`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying(128) NOT NULL, "limit_amount" money, "limit_reset_period" "public"."enum_category_limit_reset_period" NOT NULL DEFAULT 'none', "goal_id" uuid, CONSTRAINT "REL_efc7cf13cd2c4d4ff492bd3dfa" UNIQUE ("goal_id"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enum_transactions_type" AS ENUM('income', 'expense')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" money NOT NULL, "type" "public"."enum_transactions_type" NOT NULL, "description" text, "date" TIMESTAMP NOT NULL, "account_id" uuid NOT NULL, "category_id" uuid, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TABLE "accounts" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "budget_id" uuid NOT NULL, "bank_id" uuid, "unlinked_account_id" uuid, CONSTRAINT "REL_82bf2a76317b7b4506fa5db0e4" UNIQUE ("bank_id"), CONSTRAINT "REL_cc4e5a8eb76926c5be8731b294" UNIQUE ("unlinked_account_id"), CONSTRAINT "ch_account_bank_or_unlinked" CHECK (
    (bank_id IS NULL AND unlinked_account_id IS NOT NULL) OR
    (bank_id IS NOT NULL AND unlinked_account_id IS NULL)
), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
    await queryRunner.query(
      `CREATE TYPE "public"."enum_analytics_prediction_type" AS ENUM('expenses', 'income', 'category_distribution')`,
    );
    await queryRunner.query(
      `CREATE TABLE "analytics" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "prediction_type" "public"."enum_analytics_prediction_type" NOT NULL, "prediction_data" jsonb NOT NULL, "budget_id" uuid NOT NULL, CONSTRAINT "PK_3c96dcbf1e4c57ea9e0c3144bff" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "budgets" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(128) NOT NULL, "settings" jsonb NOT NULL DEFAULT '{}', "user_id" uuid NOT NULL, CONSTRAINT "PK_9c8a51748f82387644b773da482" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(64) NOT NULL, "login" character varying(64) NOT NULL, "password" character varying(128), "is_activated" boolean NOT NULL DEFAULT false, "settings" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "fk_token_to_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "debts" ADD CONSTRAINT "fk_debts_to_budget" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
    await queryRunner.query(
      `ALTER TABLE "goals" ADD CONSTRAINT "fk_goals_to_budget" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" ADD CONSTRAINT "fk_category_spending_to_spending" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "fk_category_to_goal" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "fk_transactions_to_account" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "fk_transactions_to_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "fk_account_to_budget" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "fk_account_to_bank" FOREIGN KEY ("bank_id") REFERENCES "bank"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "fk_account_to_unlinked_account" FOREIGN KEY ("unlinked_account_id") REFERENCES "unlinked_account"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics" ADD CONSTRAINT "fk_analytic_to_budget" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" ADD CONSTRAINT "fk_budgets_to_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "budgets" DROP CONSTRAINT "fk_budgets_to_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics" DROP CONSTRAINT "fk_analytic_to_budget"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "fk_account_to_unlinked_account"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "fk_account_to_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "fk_account_to_budget"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "fk_transactions_to_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "fk_transactions_to_account"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "fk_category_to_goal"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_spending" DROP CONSTRAINT "fk_category_spending_to_spending"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" DROP CONSTRAINT "fk_goals_to_budget"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminders" DROP CONSTRAINT "FK_reminder_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminders" DROP CONSTRAINT "FK_reminder_debt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminders" DROP CONSTRAINT "FK_reminder_goal"`,
    );
    await queryRunner.query(
      `ALTER TABLE "debts" DROP CONSTRAINT "fk_debts_to_budget"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" DROP CONSTRAINT "fk_token_to_user"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "budgets"`);
    await queryRunner.query(`DROP TABLE "analytics"`);
    await queryRunner.query(
      `DROP TYPE "public"."enum_analytics_prediction_type"`,
    );
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "public"."enum_transactions_type"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(
      `DROP TYPE "public"."enum_category_limit_reset_period"`,
    );
    await queryRunner.query(`DROP TABLE "category_spending"`);
    await queryRunner.query(`DROP TABLE "goals"`);
    await queryRunner.query(`DROP TYPE "public"."enum_goals_period"`);
    await queryRunner.query(`DROP TABLE "reminders"`);
    await queryRunner.query(`DROP TYPE "public"."enum_reminder_entity_type"`);
    await queryRunner.query(`DROP TABLE "debts"`);
    await queryRunner.query(`DROP TABLE "unlinked_account"`);
    await queryRunner.query(`DROP TYPE "public"."enum_unlinked_account_type"`);
    await queryRunner.query(`DROP TABLE "bank"`);
    await queryRunner.query(`DROP TABLE "tokens"`);
    await queryRunner.query(`DROP TYPE "public"."enum_tokens_token_type"`);
  }
}
