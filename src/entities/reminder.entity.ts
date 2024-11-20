import {
  BeforeInsert,
  BeforeUpdate,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  TypeORMError,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Goal } from './goal.entity';
import { Debt } from './debt.entity';
import { Category } from './category.entity';
import { ReminderEntityType } from 'src/constants/enums';

@Entity({ name: 'reminders' })
@Check('chk_reminder_entity_id', 'entity_id IS NOT NULL')
export class Reminder extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 128, nullable: false })
  title: string;

  @Column({
    type: 'enum',
    enum: ReminderEntityType,
    enumName: 'enum_reminder_entity_type',
    nullable: false,
    name: 'entity_type',
  })
  entityType: ReminderEntityType;

  @ManyToOne(() => Goal, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({
    name: 'entity_id',
    foreignKeyConstraintName: 'FK_reminder_goal',
  })
  goal: Goal;

  @ManyToOne(() => Debt, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({
    name: 'entity_id',
    foreignKeyConstraintName: 'FK_reminder_debt',
  })
  debt: Debt;

  @ManyToOne(() => Category, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({
    name: 'entity_id',
    foreignKeyConstraintName: 'FK_reminder_category',
  })
  category: Category;

  constructor(
    title: string,
    entityType: ReminderEntityType,
    goal?: Goal,
    debt?: Debt,
    category?: Category,
  ) {
    super();
    this.title = title;
    this.entityType = entityType;
    this.goal = goal || null;
    this.debt = debt || null;
    this.category = category || null;
  }

  @BeforeInsert()
  @BeforeUpdate()
  validatePolymorphicRelationship() {
    if (!this.goal && !this.debt && !this.category) {
      throw new TypeORMError(
        'At least one of goal, debt, or category must be provided.',
      );
    }
  }
}
