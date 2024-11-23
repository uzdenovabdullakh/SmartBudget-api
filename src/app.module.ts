import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from './modules/typeorm.module';
import { MailModule } from './modules/mail.module';
import { UsersModule } from './modules/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule,
    MailModule,
    UsersModule,
  ],
  providers: [Logger],
})
export class AppModule {}
