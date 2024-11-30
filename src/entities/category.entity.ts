import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Transaction } from './transaction.entity';
import { BudgetsCategories } from './budgets-categories.entity';

@Entity({ name: 'categories' })
export class Category extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, length: 128, type: 'varchar' })
  type: string;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];

  @OneToMany(
    () => BudgetsCategories,
    (budgetsCategories) => budgetsCategories.category,
  )
  budgetsCategories: BudgetsCategories[];

  constructor(type: string) {
    super();
    this.type = type;
  }
}
