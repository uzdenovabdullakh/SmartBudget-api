import { Entity, Column, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Account } from './account.entity';

@Entity({ name: 'bank' })
export class Bank extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, length: 128 })
  name: string;

  @Column({
    nullable: false,
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column({ nullable: false, type: 'text' })
  access_token: string;

  @Column({ nullable: false, type: 'text' })
  refresh_token: string;

  @OneToOne(() => Account, (account) => account.bank)
  account: Account;

  constructor(name: string, access_token: string, refresh_token: string) {
    super();
    this.name = name;
    this.access_token = access_token;
    this.refresh_token = refresh_token;
  }
}
