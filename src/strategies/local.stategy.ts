import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/services/auth.service';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import { LoginSchema } from 'src/validation/login.schema';
import { TranslationService } from 'src/services/translation.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly t: TranslationService,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    const parsedData = LoginSchema.safeParse({ email, password });
    if (!parsedData.success) {
      const errorMessages = JSON.parse(parsedData.error.message)
        .map((d) => d.message.replace(/\"/g, ''))
        .join('\n');
      throw ApiException.badRequest(errorMessages);
    }

    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw ApiException.badRequest(this.t.tException('invalid_credentials'));
    }
    return user;
  }
}
