import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ErrorMessages } from 'src/constants/constants';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import { UsersService } from 'src/services/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
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
      throw ApiException.badRequest(ErrorMessages.USER_NOT_FOUND);
    }
    return user;
  }
}
