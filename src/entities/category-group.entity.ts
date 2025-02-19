import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Timestamps } from './timestamps.entity';
import { Budget } from './budget.entity';

@Entity('category_groups')
export class CategoryGroup extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128, nullable: false })
  name: string;

  @Column({ type: 'smallint', nullable: true })
  order: number;

  @OneToMany(() => Category, (category) => category.group)
  categories: Category[];

  @ManyToOne(() => Budget, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'budget_id',
    foreignKeyConstraintName: 'fk_category_group_to_budget',
  })
  budget: Budget;
}
