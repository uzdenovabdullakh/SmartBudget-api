import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from './modules/typeorm.module';
import { MailModule } from './modules/mail.module';
import { UsersModule } from './modules/users.module';
import { AuthModule } from './modules/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { BudgetsModule } from './modules/budgets.module';
import { CronJobsModule } from './modules/cron-jobs.module';
import { AccountsModule } from './modules/accounts.module';
import { CategoriesModule } from './modules/categories.module';
import { CategoryGroupsModule } from './modules/category-groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule,
    MailModule,
    UsersModule,
    AuthModule,
    BudgetsModule,
    CronJobsModule,
    AccountsModule,
    CategoriesModule,
    CategoryGroupsModule,
  ],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
