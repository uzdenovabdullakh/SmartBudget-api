import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Token } from './token.entity';
import { Budget } from './budget.entity';
import { Brief } from './brief.entity';

@Entity({ name: 'users' })
export class User extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, unique: true, length: 64 })
  email: string;

  @Column({ type: 'varchar', nullable: false, length: 64 })
  login: string;

  @Column({ type: 'varchar', nullable: true, length: 128 })
  password?: string;

  @Column({
    name: 'is_activated',
    nullable: false,
    default: false,
    type: 'bool',
  })
  isActivated: boolean;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 64,
    name: 'yandex_id',
  })
  yandexId: string;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => Budget, (budget) => budget.user)
  budgets: Budget[];

  @OneToOne(() => Brief, (brief) => brief.user)
  brief: Brief;

  constructor(email: string, login?: string, password?: string) {
    super();
    this.email = email;
    this.password = password || null;
    this.login = login || email?.split('@')[0];
  }
}
