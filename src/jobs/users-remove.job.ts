import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UsersRemoveService {
  private readonly logger = new Logger(UsersRemoveService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteOldUsers() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const result = await this.userRepository.delete({
        deletedAt: LessThan(thirtyDaysAgo),
      });

      this.logger.log(
        `Deleted ${result.affected} users removed over 30 days ago`,
      );
    } catch (error) {
      this.logger.error('Failed to delete old users', error.stack);
    }
  }
}
