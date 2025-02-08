import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Budget } from './budget.entity';
import { Bank } from './bank.entity';
import { UnlinkedAccount } from './unlinked-account.entity';
import { Transaction } from './transaction.entity';
import { AccountType } from 'src/constants/enums';

@Entity({ name: 'accounts' })
@Check(
  'ch_account_bank_or_unlinked',
  `
    (bank_id IS NULL AND unlinked_account_id IS NOT NULL) OR
    (bank_id IS NOT NULL AND unlinked_account_id IS NULL)
`,
)
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

  @ManyToOne(() => Budget, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'budget_id',
    foreignKeyConstraintName: 'fk_account_to_budget',
  })
  budget: Budget;

  @OneToOne(() => Bank, {
    onDelete: 'CASCADE',
    nullable: true,
    cascade: ['remove'],
  })
  @JoinColumn({
    name: 'bank_id',
    foreignKeyConstraintName: 'fk_account_to_bank',
  })
  bank: Bank;

  @OneToOne(() => UnlinkedAccount, {
    onDelete: 'CASCADE',
    nullable: true,
    cascade: ['remove'],
  })
  @JoinColumn({
    name: 'unlinked_account_id',
    foreignKeyConstraintName: 'fk_account_to_unlinked_account',
  })
  unlinkedAccount: UnlinkedAccount;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];

  constructor(budget: Budget, bank?: Bank, unlinkedAccount?: UnlinkedAccount) {
    super();
    this.budget = budget;
    this.bank = bank || null;
    this.unlinkedAccount = unlinkedAccount || null;
  }
}
