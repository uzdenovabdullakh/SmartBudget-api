import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from 'src/services/mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { I18nService } from 'nestjs-i18n';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService, i18n: I18nService) => ({
        transport: configService.get('MAILER_URL'),
        defaults: {
          from: 'SmartBudget Team',
        },
        template: {
          dir: join('src', 'assets'),
          adapter: new HandlebarsAdapter({ t: i18n.hbsHelper }),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService, I18nService],
    }),
  ],
  providers: [MailService],
})
export class MailModule {}
