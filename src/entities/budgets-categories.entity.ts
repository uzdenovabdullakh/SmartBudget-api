import {
  Entity,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Budget } from './budget.entity';
import { CategorySpending } from './category-spending.entity';
import { CategoryLimitResetPeriod } from 'src/constants/enums';
import { Goal } from './goal.entity';

@Entity('budgets_categories')
export class BudgetsCategories {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    foreignKeyConstraintName: 'fk_budgets_categories_to_goal',
  })
  goal: Goal;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'fk_budgets_categories_to_categories',
  })
  category: Category;

  @ManyToOne(() => Budget, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'budget_id',
    foreignKeyConstraintName: 'fk_budgets_categories_to_budgets',
  })
  budget: Budget;

  @OneToOne(
    () => CategorySpending,
    (categorySpending) => categorySpending.budgetCategory,
  )
  categorySpending: CategorySpending;
}
