import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Budget } from './budget.entity';
import { Timestamps } from './timestamps.entity';
import { Reminder } from './reminder.entity';
import { NumericTransformer } from 'src/utils/numeric-transformer';

@Entity({ name: 'debts' })
export class Debt extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    length: 128,
    type: 'varchar',
  })
  creditor: string;

  @Column({
    nullable: false,
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new NumericTransformer(),
  })
  amount: number;

  @Column({
    type: 'timestamp',
    nullable: false,
    name: 'due_date',
  })
  dueDate: Date;

  @ManyToOne(() => Budget, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'budget_id',
    foreignKeyConstraintName: 'fk_debts_to_budget',
  })
  budget: Budget;

  @OneToMany(() => Reminder, (reminder) => reminder.debt)
  reminders: Reminder[];

  constructor(creditor: string, amount: number, dueDate: Date, budget: Budget) {
    super();
    this.creditor = creditor;
    this.amount = amount;
    this.budget = budget;
    this.dueDate = dueDate;
  }
}
