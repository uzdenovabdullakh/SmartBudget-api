import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Budget } from './budget.entity';

@Entity({ name: 'analytics' })
export class Analytic extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    type: 'jsonb',
    name: 'conversation_history',
  })
  conversationHistory: Array<{ role: string; content: string }>;

  @ManyToOne(() => Budget, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'budget_id',
    foreignKeyConstraintName: 'fk_analytic_to_budget',
  })
  budget: Budget;

  constructor(
    budget: Budget,
    conversationHistory: Array<{ role: string; content: string }>,
  ) {
    super();
    this.budget = budget;
    this.conversationHistory = conversationHistory;
  }
}
