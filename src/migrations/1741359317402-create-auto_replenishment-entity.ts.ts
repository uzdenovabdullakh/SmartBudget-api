import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAutoReplenishmentEntity1741359317402
  implements MigrationInterface
{
  name = 'CreateAutoReplenishmentEntity1741359317402';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auto_replenishment" ("created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "percentage" smallint NOT NULL, "goal_id" uuid NOT NULL, CONSTRAINT "REL_9fa09384a0a8fbcc008278cf5e" UNIQUE ("goal_id"), CONSTRAINT "PK_b8511192c118a64dae84a83652b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "auto_replenishment" ADD CONSTRAINT "fk_auto_replenishment_to_goal" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auto_replenishment" DROP CONSTRAINT "fk_auto_replenishment_to_goal"`,
    );
    await queryRunner.query(`DROP TABLE "auto_replenishment"`);
  }
}
