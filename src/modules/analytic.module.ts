import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticController } from 'src/controllers/analytic.controller';
import { Transaction } from 'src/entities/transaction.entity';
import { AnalyticService } from 'src/services/analytic.service';

@Module({
  controllers: [AnalyticController],
  providers: [AnalyticService],
  imports: [TypeOrmModule.forFeature([Transaction])],
})
export class AnalyticModule {}
