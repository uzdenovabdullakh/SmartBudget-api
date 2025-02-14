import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Category } from './category.entity';
import { Account } from './account.entity';
import { NumericTransformer } from 'src/utils/numeric-transformer';

@Entity({ name: 'transactions' })
export class Transaction extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new NumericTransformer(),
  })
  inflow: number;

  @Column({
    nullable: true,
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new NumericTransformer(),
  })
  outflow: number;

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
    account: Account,
    date: Date,
    description?: string,
    category?: Category,
  ) {
    super();
    this.account = account;
    this.date = date;
    this.description = description || null;
    this.category = category || null;
  }
}
