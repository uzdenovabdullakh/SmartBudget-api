import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'src/controllers/auth.controller';
import { Token } from 'src/entities/token.entity';
import { User } from 'src/entities/user.entity';
import { AuthService } from 'src/services/auth.service';
import { JwtTokenModule } from './jwt-token.module';
import { UsersService } from 'src/services/users.service';
import { MailService } from 'src/services/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Token]),
    ConfigModule,
    JwtTokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, MailService],
})
export class AuthModule {}
