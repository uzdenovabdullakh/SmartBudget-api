import { Entity, Column, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { Account } from './account.entity';

@Entity({ name: 'unlinked_account' })
export class UnlinkedAccount extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, length: 64 })
  name: string;

  @Column({
    nullable: false,
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @OneToOne(() => Account, (account) => account.bank)
  account: Account;

  constructor(name: string, amount: number) {
    super();
    this.name = name;
    this.amount = amount;
  }
}
