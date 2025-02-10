import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from 'src/controllers/transactions.controller';
import { Account } from 'src/entities/account.entity';
import { Budget } from 'src/entities/budget.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionsService } from 'src/services/transactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Budget, Account])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
