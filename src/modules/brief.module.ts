import { Module } from '@nestjs/common';
import { BriefController } from 'src/controllers/brief.controller';
import { BriefService } from 'src/services/brief.service';

@Module({
  controllers: [BriefController],
  providers: [BriefService],
})
export class BriefModule {}
