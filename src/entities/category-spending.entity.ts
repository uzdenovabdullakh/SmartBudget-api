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
import { Period } from 'src/constants/enums';
import { NumericTransformer } from 'src/utils/numeric-transformer';

@Entity({ name: 'category_spending' })
@Unique('uk_category_period', ['category', 'periodStart', 'periodEnd'])
export class CategorySpending extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    default: 0,
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'spent_amount',
    transformer: new NumericTransformer(),
  })
  spentAmount: number;

  @Column({ nullable: false, type: 'timestamp', name: 'period_start' })
  periodStart: Date;

  @Column({ nullable: false, type: 'timestamp', name: 'period_end' })
  periodEnd: Date;

  @Column({
    nullable: true,
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'limit_amount',
    transformer: new NumericTransformer(),
  })
  limitAmount: number;

  @Column({
    default: Period.NONE,
    enum: Period,
    type: 'enum',
    enumName: 'enum_period',
    name: 'limit_reset_period',
  })
  limitResetPeriod: Period;

  @OneToOne(() => Category, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'fk_category_spending_to_category',
  })
  category: Category;

  constructor(
    category: Category,
    periodStart: Date,
    periodEnd: Date,
    spentAmount?: number,
    limitAmount?: number,
    limitResetPeriod?: Period,
  ) {
    super();
    this.category = category;
    this.periodStart = periodStart;
    this.periodEnd = periodEnd;
    this.limitAmount = limitAmount;
    this.limitResetPeriod = limitResetPeriod;
    this.spentAmount = spentAmount;
  }
}
