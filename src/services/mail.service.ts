import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokensType } from 'src/constants/enums';
import { ApiException } from 'src/exceptions/api.exception';
import { MailData, MailOptions } from 'src/types/mail.types';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private async sendMail<T>(data: MailData<T>, templatePath: string) {
    try {
      const { to, subject, payload, inviter, userName } = data;
      await this.mailerService.sendMail({
        to,
        subject,
        template: `./${templatePath}`,
        context: {
          payload,
          inviter,
          userName: userName || 'SmartBudget User',
        },
      });
    } catch (e) {
      console.log(e);
      throw ApiException.serverError('Mail does not send!');
    }
  }

  async sendMailByType(type: TokensType, mailData: MailOptions) {
    const { email, token, userName } = mailData;
    const urlMap = {
      [TokensType.ACTIVATE_ACCOUNT]: `${this.configService.get<string>('CLIENT_URL')}/auth/signup/confirm/${token}`,
      [TokensType.RESET_PASSWORD]: `${this.configService.get<string>('CLIENT_URL')}/auth/password/confirm/${token}`,
      [TokensType.RESTORE_ACCOUNT]: `${this.configService.get<string>('CLIENT_URL')}/auth/restore/${token}`,
    };

    const subjectMap = {
      [TokensType.ACTIVATE_ACCOUNT]: 'Welcome to the SmartBudget',
      [TokensType.RESET_PASSWORD]: 'Reset your password',
      [TokensType.RESTORE_ACCOUNT]: 'Welcome back to the SmartBudget',
    };

    const url = urlMap[type];
    const subject = subjectMap[type];

    if (!url || !subject) {
      throw ApiException.badRequest('Invalid token type for email.');
    }

    await this.sendMail(
      { to: email, subject, payload: url, userName },
      type as string,
    );
  }
}
