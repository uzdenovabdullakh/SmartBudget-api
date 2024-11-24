import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'src/controllers/auth.controller';
import { Token } from 'src/entities/token.entity';
import { User } from 'src/entities/user.entity';
import { AuthService } from 'src/services/auth.service';
import { JwtTokenModule } from './jwt-token.module';
import { UsersService } from 'src/services/users.service';
import { MailService } from 'src/services/mail.service';
import { BcryptService } from 'src/services/bcrypt.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/strategies/local.stategy';
import { JwtStrategy } from 'src/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Token]),
    JwtTokenModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    MailService,
    BcryptService,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class AuthModule {}
