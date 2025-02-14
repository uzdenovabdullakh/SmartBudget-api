import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Budget } from './budget.entity';
import { Transaction } from './transaction.entity';
import { AccountType } from 'src/constants/enums';
import { NumericTransformer } from 'src/utils/numeric-transformer';

@Entity({ name: 'accounts' })
export class Account extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    enumName: 'enum_account_type',
    nullable: false,
  })
  type: AccountType;

  @Column({ type: 'varchar', nullable: false, length: 64 })
  name: string;

  @Column({
    nullable: false,
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new NumericTransformer(),
  })
  amount: number;

  @ManyToOne(() => Budget, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'budget_id',
    foreignKeyConstraintName: 'fk_account_to_budget',
  })
  budget: Budget;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];

  constructor(budget: Budget) {
    super();
    this.budget = budget;
  }
}
