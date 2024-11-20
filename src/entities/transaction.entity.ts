import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Category } from './category.entity';
import { TransactionType } from 'src/constants/enums';
import { Account } from './account.entity';

@Entity({ name: 'transactions' })
export class Transaction extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    type: 'money',
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
    enumName: 'enum_transactions_type',
    nullable: false,
  })
  type: TransactionType;

  @Column({
    nullable: true,
    type: 'text',
    default: null,
  })
  description: string;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  date: Date;

  @ManyToOne(() => Account, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'account_id',
    foreignKeyConstraintName: 'fk_transactions_to_account',
  })
  account: Account;

  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'fk_transactions_to_category',
  })
  category: Category;

  constructor(
    amount: number,
    account: Account,
    type: TransactionType,
    date: Date,
    description?: string,
    category?: Category,
  ) {
    super();
    this.amount = amount;
    this.account = account;
    this.type = type;
    this.date = date;
    this.description = description || null;
    this.category = category || null;
  }
}
