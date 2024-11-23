import { Entity, Column, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from './timestamps.entity';
import { UnlinkedAccountType } from 'src/constants/enums';
import { Account } from './account.entity';

@Entity({ name: 'unlinked_account' })
export class UnlinkedAccount extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, length: 64 })
  name: string;

  @Column({
    nullable: false,
    type: 'money',
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: UnlinkedAccountType,
    enumName: 'enum_unlinked_account_type',
    nullable: false,
  })
  type: UnlinkedAccountType;

  @OneToOne(() => Account, (account) => account.bank)
  account: Account;

  constructor(name: string, amount: number, type: UnlinkedAccountType) {
    super();
    this.name = name;
    this.amount = amount;
    this.type = type;
  }
}
