import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from 'src/entities/token.entity';
import { User } from 'src/entities/user.entity';
import { TokensRemoveService } from 'src/jobs/tokens-remove.job';
import { UsersRemoveService } from 'src/jobs/users-remove.job';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([Token, User])],
  providers: [TokensRemoveService, UsersRemoveService],
})
export class CronJobsModule {}
