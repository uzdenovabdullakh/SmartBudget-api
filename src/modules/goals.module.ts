import { Module } from '@nestjs/common';
import { GoalsService } from 'src/services/goals.service';
import { GoalsController } from 'src/controllers/goals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from 'src/entities/budget.entity';
import { Category } from 'src/entities/category.entity';
import { Goal } from 'src/entities/goal.entity';

@Module({
  controllers: [GoalsController],
  providers: [GoalsService],
  imports: [TypeOrmModule.forFeature([Budget, Category, Goal])],
})
export class GoalsModule {}
