import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Goal } from './goal.entity';
import { Transaction } from './transaction.entity';
import { CategoryLimitResetPeriod } from 'src/constants/enums';
import { CategorySpending } from './category-spending.entity';

@Entity({ name: 'categories' })
export class Category extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, length: 128, type: 'varchar' })
  type: string;

  @Column({ nullable: true, type: 'money', name: 'limit_amount' })
  limitAmount: number;

  @Column({
    default: CategoryLimitResetPeriod.NONE,
    enum: CategoryLimitResetPeriod,
    type: 'enum',
    enumName: 'enum_category_limit_reset_period',
    name: 'limit_reset_period',
  })
  limitResetPeriod: CategoryLimitResetPeriod;

  @OneToOne(() => Goal, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({
    name: 'goal_id',
    foreignKeyConstraintName: 'fk_category_to_goal',
  })
  goal: Goal;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];

  @OneToOne(
    () => CategorySpending,
    (categorySpending) => categorySpending.category,
  )
  categorySpending: CategorySpending;

  constructor(
    type: string,
    limitAmount?: number,
    limitResetPeriod?: CategoryLimitResetPeriod,
  ) {
    super();
    this.type = type;
    this.limitAmount = limitAmount || null;
    this.limitResetPeriod = limitResetPeriod || CategoryLimitResetPeriod.NONE;
  }
}
