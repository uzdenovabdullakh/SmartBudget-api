import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Token } from './token.entity';
import { Budget } from './budget.entity';

@Entity({ name: 'users' })
export class User extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true, length: 64 })
  email: string;

  @Column({ nullable: false, length: 64 })
  login: string;

  @Column({ nullable: true, length: 128 })
  password?: string;

  @Column({ name: 'is_activated', nullable: false, default: false })
  isActivated: boolean;

  @Column({
    nullable: false,
    default: () => `'{}'`,
    type: 'jsonb',
  })
  settings: object;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => Budget, (budget) => budget.user)
  budgets: Budget[];

  constructor(
    email: string,
    login?: string,
    password?: string,
    settings?: object,
  ) {
    super();
    this.email = email;
    this.password = password || null;
    this.login = login || email?.split('@')[0];
    this.settings = settings || {};
  }
}
