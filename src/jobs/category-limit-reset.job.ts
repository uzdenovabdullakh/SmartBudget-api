import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Period } from 'src/constants/enums';
import { CategorySpending } from 'src/entities/category-spending.entity';
import { calculatePeriod } from 'src/utils/helpers';
import { Repository, LessThanOrEqual } from 'typeorm';

@Injectable()
export class ResetSpendingService {
  private readonly logger = new Logger(ResetSpendingService.name);

  constructor(
    @InjectRepository(CategorySpending)
    private readonly categorySpendingRepository: Repository<CategorySpending>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetSpendingLimits() {
    try {
      const now = new Date();

      const categorySpendings = await this.categorySpendingRepository.find({
        where: { periodEnd: LessThanOrEqual(now) },
      });

      if (!categorySpendings.length) {
        this.logger.log('No spending limits to reset.');
        return;
      }

      for (const spending of categorySpendings) {
        if (spending.limitResetPeriod !== Period.NONE) {
          spending.spentAmount = 0;
          const [newPeriodStart, newPeriodEnd] = calculatePeriod(
            spending.limitResetPeriod,
          );
          spending.periodStart = newPeriodStart;
          spending.periodEnd = newPeriodEnd;

          this.logger.log(
            `Reset spending for category ${spending.category.id}. New period: ${newPeriodStart} - ${newPeriodEnd}`,
          );

          await this.categorySpendingRepository.save(spending);
        }
      }

      this.logger.log('Spending limits reset successfully.');
    } catch (error) {
      this.logger.error('Failed to reset spending limits', error.stack);
    }
  }
}
