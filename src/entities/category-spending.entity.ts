import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Unique,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Category } from './category.entity';

@Entity({ name: 'category_spending' })
@Unique('uk_category_period', ['category', 'periodStart', 'periodEnd'])
export class CategorySpending extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0, type: 'money', name: 'spent_amount' })
  spentAmount: number;

  @Column({ nullable: false, type: 'timestamp', name: 'period_start' })
  periodStart: Date;

  @Column({ nullable: false, type: 'timestamp', name: 'period_end' })
  periodEnd: Date;

  @OneToOne(() => Category, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'fk_category_spending_to_spending',
  })
  category: Category;

  constructor(
    category: Category,
    periodStart: Date,
    periodEnd: Date,
    spentAmount?: number,
  ) {
    super();
    this.category = category;
    this.periodStart = periodStart;
    this.periodEnd = periodEnd;
    this.spentAmount = spentAmount || 0;
  }
}
