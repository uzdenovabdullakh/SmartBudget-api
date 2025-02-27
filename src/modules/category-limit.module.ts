import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategorySpendingController } from 'src/controllers/category-spending.controller';
import { CategorySpending } from 'src/entities/category-spending.entity';
import { Category } from 'src/entities/category.entity';
import { CategorySpendingService } from 'src/services/category-spending.service';

@Module({
  controllers: [CategorySpendingController],
  providers: [CategorySpendingService],
  imports: [TypeOrmModule.forFeature([Category, CategorySpending])],
})
export class CategorySpendgingModule {}
