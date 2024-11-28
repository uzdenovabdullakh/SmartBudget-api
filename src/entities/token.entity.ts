import {
  Entity,
  JoinColumn,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Timestamps } from './timestamps.entity';
import { TokensType } from 'src/constants/enums';

@Entity({ name: 'tokens' })
export class Token extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  token: string;

  @Column({
    type: 'enum',
    enum: TokensType,
    enumName: 'enum_tokens_token_type',
    nullable: false,
    name: 'token_type',
  })
  tokenType: TokensType;

  @Column({
    name: 'expiration_time',
    type: 'timestamp',
  })
  expirationTime: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'fk_token_to_user' })
  user: User;

  constructor(
    user: User,
    token: string,
    tokenType: TokensType,
    expirationTime: Date,
  ) {
    super();
    this.token = token;
    this.tokenType = tokenType;
    this.user = user;
    this.expirationTime = expirationTime;
  }
}
