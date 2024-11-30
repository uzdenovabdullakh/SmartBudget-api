import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Unique,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { BudgetsCategories } from './budgets-categories.entity';

@Entity({ name: 'category_spending' })
@Unique('uk_category_period', ['budgetCategory', 'periodStart', 'periodEnd'])
export class CategorySpending extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0, type: 'money', name: 'spent_amount' })
  spentAmount: number;

  @Column({ nullable: false, type: 'timestamp', name: 'period_start' })
  periodStart: Date;

  @Column({ nullable: false, type: 'timestamp', name: 'period_end' })
  periodEnd: Date;

  @OneToOne(() => BudgetsCategories, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'budget_category_id',
    foreignKeyConstraintName: 'fk_category_spending_to_budget_category',
  })
  budgetCategory: BudgetsCategories;

  constructor(
    budgetCategory: BudgetsCategories,
    periodStart: Date,
    periodEnd: Date,
    spentAmount?: number,
  ) {
    super();
    this.budgetCategory = budgetCategory;
    this.periodStart = periodStart;
    this.periodEnd = periodEnd;
    this.spentAmount = spentAmount || 0;
  }
}
