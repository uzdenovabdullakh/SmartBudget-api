import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from 'src/controllers/accounts.controller';
import { Account } from 'src/entities/account.entity';
import { AccountsService } from 'src/services/accounts.service';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService],
  imports: [TypeOrmModule.forFeature([Account])],
})
export class AccountsModule {}
