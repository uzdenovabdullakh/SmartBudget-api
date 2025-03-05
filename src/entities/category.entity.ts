import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Transaction } from './transaction.entity';
import { CategorySpending } from './category-spending.entity';
import { CategoryGroup } from './category-group.entity';
import { NumericTransformer } from 'src/utils/numeric-transformer';

@Entity({ name: 'categories' })
export class Category extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, length: 128, type: 'varchar' })
  name: string;

  @Column({
    default: 0,
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new NumericTransformer(),
  })
  assigned: number;

  @Column({
    default: 0,
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new NumericTransformer(),
  })
  spent: number;

  @Column({
    default: 0,
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new NumericTransformer(),
  })
  available: number;

  @Column({ type: 'smallint', nullable: true })
  order: number;

  @ManyToOne(() => CategoryGroup, (group) => group.categories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group: CategoryGroup;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];

  @OneToOne(
    () => CategorySpending,
    (categorySpending) => categorySpending.category,
  )
  categorySpending: CategorySpending;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
