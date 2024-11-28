import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Token } from 'src/entities/token.entity';

@Injectable()
export class TokensRemoveService {
  private readonly logger = new Logger(TokensRemoveService.name);

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredTokens() {
    const now = new Date();

    try {
      const result = await this.tokenRepository.delete({
        expirationTime: LessThan(now),
      });

      this.logger.log(`Deleted ${result.affected} expired tokens`);
    } catch (error) {
      this.logger.error('Failed to delete expired tokens', error.stack);
    }
  }
}
