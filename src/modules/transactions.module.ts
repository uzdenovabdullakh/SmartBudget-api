import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from 'src/controllers/transactions.controller';
import { Budget } from 'src/entities/budget.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionsService } from 'src/services/transactions.service';
import { CategoriesModule } from './categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Budget]), CategoriesModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
