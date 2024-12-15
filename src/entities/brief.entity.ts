import {
  Entity,
  Column,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'brief' })
export class Brief {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'jsonb',
    nullable: false,
    default: () => `'{}'`,
    name: 'brief_answers',
  })
  briefAnswers: Record<string, string | string[]>;

  @Column({
    type: 'bool',
    name: 'is_completed',
    nullable: false,
    default: false,
  })
  isCompleted: boolean;

  @OneToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_brief_to_user',
  })
  user: User;
}
