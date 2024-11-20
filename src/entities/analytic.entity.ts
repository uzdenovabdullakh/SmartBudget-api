import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Budget } from './budget.entity';
import { AnalyticsPredictionType } from 'src/constants/enums';

@Entity({ name: 'analytics' })
export class Analytic extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AnalyticsPredictionType,
    enumName: 'enum_analytics_prediction_type',
    nullable: false,
    name: 'prediction_type',
  })
  predictionType: AnalyticsPredictionType;

  @Column({
    nullable: false,
    type: 'jsonb',
    name: 'prediction_data',
  })
  predictionData: object;

  @ManyToOne(() => Budget, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'budget_id',
    foreignKeyConstraintName: 'fk_analytic_to_budget',
  })
  budget: Budget;

  constructor(
    budget: Budget,
    predictionType: AnalyticsPredictionType,
    predictionData: object,
  ) {
    super();
    this.budget = budget;
    this.predictionData = predictionData;
    this.predictionType = predictionType;
  }
}
