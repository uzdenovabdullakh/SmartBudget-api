import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { TranslationService } from 'src/services/translation.service';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import { UsersService } from 'src/services/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly t: TranslationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECRET_KEY'),
    });
  }

  async validate(payload: { email: string }): Promise<User> {
    const user = await this.userService.findOneByEmail(payload.email);
    if (!user) {
      throw ApiException.notFound(this.t.tException('not_found', 'user'));
    }
    return user;
  }
}
