import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { User } from './user.entity';
import { Account } from './account.entity';
import { Debt } from './debt.entity';
import { Goal } from './goal.entity';
import { Analytic } from './analytic.entity';
import { BudgetSettings } from 'src/validation/budget.schema';
import { Category } from './category.entity';
import { NumericTransformer } from 'src/utils/numeric-transformer';

@Entity({ name: 'budgets' })
export class Budget extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, length: 128 })
  name: string;

  @Column({
    nullable: false,
    default: () => `'{"currency": "$", "currencyPlacement": "before"}'`,
    type: 'jsonb',
  })
  settings: BudgetSettings;

  @Column({
    default: 0,
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'assigned_amount',
    transformer: new NumericTransformer(),
  })
  assignedAmount: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_budgets_to_user',
  })
  user: User;

  @OneToMany(() => Account, (account) => account.budget)
  accounts: Account[];

  @OneToMany(() => Debt, (debt) => debt.budget)
  debts: Debt[];

  @OneToMany(() => Goal, (goal) => goal.budget)
  goals: Goal[];

  @OneToMany(() => Analytic, (analytic) => analytic.budget)
  analytics: Analytic[];

  @OneToMany(() => Category, (categories) => categories.budget)
  categories: Category[];

  constructor(name: string, user: User, settings?: BudgetSettings) {
    super();
    this.name = name;
    this.user = user;
    this.settings = settings;
  }
}
