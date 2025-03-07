import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Goal } from './goal.entity';

@Entity({ name: 'auto_replenishment' })
export class AutoReplenishment extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'smallint',
  })
  percentage: number;

  @OneToOne(() => Goal, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'goal_id',
    foreignKeyConstraintName: 'fk_auto_replenishment_to_goal',
  })
  goal: Goal;
}
