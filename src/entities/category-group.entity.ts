import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { Timestamps } from './timestamps.entity';

@Entity('category_groups')
export class CategoryGroup extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128, nullable: false })
  name: string;

  @OneToMany(() => Category, (category) => category.group)
  categories: Category[];
}
