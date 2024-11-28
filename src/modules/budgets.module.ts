import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetsController } from 'src/controllers/budgets.controller';
import { Budget } from 'src/entities/budget.entity';
import { BudgetsService } from 'src/services/budgets.service';

@Module({
  controllers: [BudgetsController],
  providers: [BudgetsService],
  imports: [TypeOrmModule.forFeature([Budget])],
})
export class BudgetsModule {}
