import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { User } from 'src/entities/user.entity';
import { AnalyticResponseDto } from 'src/types/analytic.type';
import { Repository } from 'typeorm';
import { TranslationService } from './translation.service';
import { AnalyticQueryDtoType } from 'src/validation/analytic.schema';

@Injectable()
export class AnalyticService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly t: TranslationService,
  ) {}

  async getExpensesByCategory(
    budgetId: string,
    query: AnalyticQueryDtoType,
    user: User,
  ): Promise<AnalyticResponseDto> {
    return this.getAnalyticsByCategory({
      budgetId,
      query,
      type: 'expense',
      user,
    });
  }

  async getIncomesByCategory(
    budgetId: string,
    query: AnalyticQueryDtoType,
    user: User,
  ): Promise<AnalyticResponseDto> {
    return this.getAnalyticsByCategory({
      budgetId,
      query,
      type: 'income',
      user,
    });
  }

  private async getAnalyticsByCategory({
    user,
    budgetId,
    query,
    type,
  }: {
    user: User;
    budgetId: string;
    query: AnalyticQueryDtoType;
    type: 'expense' | 'income';
  }): Promise<AnalyticResponseDto> {
    const { startDate, endDate } = query;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .innerJoin('transaction.account', 'account')
      .innerJoin('account.budget', 'budget')
      .where('budget.user_id = :userId', { userId: user.id })
      .andWhere('budget.id = :budgetId', { budgetId });

    if (type === 'expense') {
      queryBuilder.andWhere('transaction.outflow > 0');
    } else if (type === 'income') {
      queryBuilder.andWhere('transaction.inflow > 0');
    }
    if (startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', { endDate });
    }

    const transactions = await queryBuilder.getMany();

    const categoryMap = new Map<string, { amount: number; count: number }>();
    for (const transaction of transactions) {
      const categoryName =
        transaction?.category?.name || this.t.tCategories('other', 'names');
      const amount =
        type === 'expense' ? transaction.outflow : transaction.inflow;

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { amount: 0, count: 0 });
      }

      const categoryData = categoryMap.get(categoryName);
      categoryData.amount += amount;
      categoryData.count += 1;
    }

    const categories = Array.from(categoryMap.keys());
    const amounts = categories.map(
      (category) => categoryMap.get(category).amount,
    );
    const operationsCount = categories.map(
      (category) => categoryMap.get(category).count,
    );

    return {
      categories,
      amounts,
      operationsCount,
    };
  }
}
