import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIController } from 'src/controllers/ai.controller';
import { Analytic } from 'src/entities/analytic.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { AIService } from 'src/services/ai.service';

@Module({
  controllers: [AIController],
  providers: [AIService],
  imports: [TypeOrmModule.forFeature([Analytic, Transaction])],
})
export class AiModule {}
