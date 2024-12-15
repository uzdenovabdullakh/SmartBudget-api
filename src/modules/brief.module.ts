import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BriefController } from 'src/controllers/brief.controller';
import { Brief } from 'src/entities/brief.entity';
import { CategoryGroup } from 'src/entities/category-group.entity';
import { Category } from 'src/entities/category.entity';
import { BriefService } from 'src/services/brief.service';

@Module({
  controllers: [BriefController],
  providers: [BriefService],
  imports: [TypeOrmModule.forFeature([Brief, Category, CategoryGroup])],
})
export class BriefModule {}
