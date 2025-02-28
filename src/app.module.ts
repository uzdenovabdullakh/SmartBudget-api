import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from './modules/typeorm.module';
import { MailModule } from './modules/mail.module';
import { UsersModule } from './modules/users.module';
import { AuthModule } from './modules/auth.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { BudgetsModule } from './modules/budgets.module';
import { CronJobsModule } from './modules/cron-jobs.module';
import { AccountsModule } from './modules/accounts.module';
import { CategoriesModule } from './modules/categories.module';
import { CategoryGroupsModule } from './modules/category-groups.module';
import { GoalsModule } from './modules/goals.module';
import { BriefModule } from './modules/brief.module';
import { LocalizationModule } from './modules/i18n.module';
import { I18nInterceptor } from './interceptors/i18n.interceptor';
import { HttpExceptionFilter } from './exceptions/exception.filter';
import { TransactionsModule } from './modules/transactions.module';
import { AnalyticModule } from './modules/analytic.module';
import { AiModule } from './modules/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    LocalizationModule,
    TypeOrmModule,
    MailModule,
    UsersModule,
    AuthModule,
    BudgetsModule,
    CronJobsModule,
    AccountsModule,
    CategoriesModule,
    CategoryGroupsModule,
    GoalsModule,
    BriefModule,
    TransactionsModule,
    AnalyticModule,
    AiModule,
  ],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: I18nInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
