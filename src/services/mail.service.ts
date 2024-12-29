import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  async resetPassword(mailData: MailOptions) {
    const { email, token, userName } = mailData;
    const url = `${this.configService.get<string>('CLIENT_URL')}/auth/password/confirm/${token}`;
    await this.sendMail(
      {
        to: email,
        subject: 'Reset your password',
        payload: url,
        userName,
      },
      'reset-password',
    );
  }

  async sendInvite(mailData: MailOptions) {
    const { email, token, userName } = mailData;
    const url = `${this.configService.get<string>('CLIENT_URL')}/auth/signup/confirm/${token}`;
    await this.sendMail(
      {
        to: email,
        subject: 'Welcome to the SmartBudget',
        payload: url,
        userName,
      },
      'invite-user',
    );
  }

  async sendTwoFactorCode(email: string, code: number) {
    await this.sendMail(
      {
        to: email,
        subject: 'Verification code',
        payload: code,
      },
      'two-factor-auth',
    );
  }
}
