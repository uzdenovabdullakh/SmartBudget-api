import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoReplenishmentController } from 'src/controllers/auto-replenishment.controller';
import { AutoReplenishment } from 'src/entities/auto-replenishment.entity';
import { AutoReplenishmentService } from 'src/services/auto-replenishment.service';

@Module({
  controllers: [AutoReplenishmentController],
  providers: [AutoReplenishmentService],
  imports: [TypeOrmModule.forFeature([AutoReplenishment])],
})
export class AutoReplenishmentModule {}
