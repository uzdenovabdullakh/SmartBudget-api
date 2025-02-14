import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Goal } from './goal.entity';
import { Transaction } from './transaction.entity';
import { CategorySpending } from './category-spending.entity';
import { Budget } from './budget.entity';
import { CategoryGroup } from './category-group.entity';
import { NumericTransformer } from 'src/utils/numeric-transformer';

@Entity({ name: 'categories' })
export class Category extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, length: 128, type: 'varchar' })
  name: string;

  @Column({
    default: 0,
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new NumericTransformer(),
  })
  assigned: number;

  @Column({
    default: 0,
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new NumericTransformer(),
  })
  activity: number;

  @Column({
    default: 0,
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new NumericTransformer(),
  })
  available: number;

  @ManyToOne(() => CategoryGroup, (group) => group.categories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group: CategoryGroup;

  @ManyToOne(() => Budget, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'budget_id',
    foreignKeyConstraintName: 'fk_categories_to_budget',
  })
  budget: Budget;

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

  constructor(name: string, group: string, budget: Budget, goal?: Goal) {
    super();
    this.name = name;
    this.budget = budget;
    this.goal = goal;
  }
}
