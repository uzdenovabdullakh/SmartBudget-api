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

@Entity({ name: 'budgets' })
export class Budget extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, length: 128 })
  name: string;

  @Column({
    nullable: false,
    default: () => `'{"currency": "USD", "currencyPlacement": "before"}'`,
    type: 'jsonb',
  })
  settings: BudgetSettings;

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

  constructor(name: string, user: User, settings?: BudgetSettings) {
    super();
    this.name = name;
    this.user = user;
    this.settings = settings;
  }
}
