import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from 'src/controllers/categories.controller';
import { Budget } from 'src/entities/budget.entity';
import { CategoryGroup } from 'src/entities/category-group.entity';
import { CategorySpending } from 'src/entities/category-spending.entity';
import { Category } from 'src/entities/category.entity';
import { CategoriesService } from 'src/services/categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [
    TypeOrmModule.forFeature([
      Budget,
      CategoryGroup,
      Category,
      CategorySpending,
    ]),
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
