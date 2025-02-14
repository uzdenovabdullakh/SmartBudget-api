import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Period } from 'src/constants/enums';
import { Budget } from './budget.entity';
import { Reminder } from './reminder.entity';
import { Category } from './category.entity';
import { NumericTransformer } from 'src/utils/numeric-transformer';

@Entity({ name: 'goals' })
export class Goal extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    default: null,
    length: 64,
    type: 'varchar',
  })
  name: string;

  @Column({
    nullable: false,
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'target_amount',
    transformer: new NumericTransformer(),
  })
  targetAmount: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    name: 'current_amount',
    transformer: new NumericTransformer(),
  })
  currentAmount: number;

  @Column({
    type: 'timestamp',
    nullable: false,
    name: 'achieve_date',
  })
  achieveDate: Date;

  @Column({
    type: 'enum',
    enum: Period,
    enumName: 'enum_period',
    nullable: false,
  })
  period: Period;

  @ManyToOne(() => Budget, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'budget_id',
    foreignKeyConstraintName: 'fk_goals_to_budget',
  })
  budget: Budget;

  @OneToMany(() => Reminder, (reminder) => reminder.goal)
  reminder: Reminder[];

  @OneToOne(() => Category, (category) => category.goal)
  category: Category;

  constructor(
    targetAmount: number,
    achieveDate: Date,
    budget: Budget,
    period: Period,
    name?: string,
    currentAmount?: number,
  ) {
    super();
    this.targetAmount = targetAmount;
    this.achieveDate = achieveDate;
    this.budget = budget;
    this.period = period;
    this.name = name || null;
    this.currentAmount = currentAmount || 0;
  }
}
