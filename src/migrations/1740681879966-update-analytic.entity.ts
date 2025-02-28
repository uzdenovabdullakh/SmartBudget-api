import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAnalyticEntity1740681879966 implements MigrationInterface {
  name = 'UpdateAnalyticEntity1740681879966';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "analytics" DROP COLUMN "prediction_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."enum_analytics_prediction_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics" DROP COLUMN "prediction_data"`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics" ADD "conversation_history" jsonb NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "analytics" DROP COLUMN "conversation_history"`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics" ADD "prediction_data" jsonb NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."enum_analytics_prediction_type" AS ENUM('category_distribution', 'expenses', 'income')`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics" ADD "prediction_type" "public"."enum_analytics_prediction_type" NOT NULL`,
    );
  }
}
