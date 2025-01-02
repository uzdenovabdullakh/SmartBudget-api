import { Module } from '@nestjs/common';
import { CategoryGroupsService } from '../services/category-groups.service';
import { CategoryGroupsController } from 'src/controllers/category-groups.controller';
import { CategoryGroup } from 'src/entities/category-group.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';

@Module({
  controllers: [CategoryGroupsController],
  providers: [CategoryGroupsService],
  imports: [TypeOrmModule.forFeature([CategoryGroup, Category])],
})
export class CategoryGroupsModule {}
