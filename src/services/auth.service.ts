import { Injectable } from '@nestjs/common';
import { TokensType } from 'src/constants/enums';
import { Repository } from 'typeorm';
import { Token } from 'src/entities/token.entity';
import { User } from 'src/entities/user.entity';
import { JwtTokenService } from './jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { BcryptService } from './bcrypt.service';
import { ChangePasswordDto } from 'src/types/dto/change-password.dto';
import { ApiException } from 'src/exceptions/api.exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtTokenService,
    private readonly bcryptService: BcryptService,
  ) {}

  async createToken(user: User, tokenType: TokensType): Promise<string> {
    const { id, email, login, isActivated } = user;
    const token = await this.jwtService.generateToken(
      { id, email, login, isActivated },
      tokenType == TokensType.ACTIVATE_ACCOUNT ? '1d' : '1h',
    );

    const tokenEntity = new Token(user, token, tokenType);
    await this.tokenRepository.save(tokenEntity);

    return token;
  }

  async verifyToken(
    token: string,
    tokenType: TokensType,
  ): Promise<User | null> {
    const tokenEntity = await this.tokenRepository.findOne({
      where: { token, tokenType },
      relations: ['user'],
    });

    if (!tokenEntity) return null;

    const isValid = await this.jwtService.validateToken(token);
    if (!isValid) return null;

    return tokenEntity.user;
  }

  async activateUser(user: User, password: string): Promise<void> {
    user.password = await this.bcryptService.hash(password);
    user.isActivated = true;
    await this.userRepository.save(user);

    await this.tokenRepository.delete({
      user,
      tokenType: TokensType.ACTIVATE_ACCOUNT,
    });
  }

  async updatePassword(user: User, newPassword: string): Promise<void> {
    user.password = await this.bcryptService.hash(newPassword);
    await this.userRepository.save(user);

    await this.tokenRepository.delete({
      user,
      tokenType: TokensType.RESET_PASSWORD,
    });
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const { newPassword, currentPassword } = dto;

    const user = await this.userRepository.findOneBy({ id });

    const isMatch = await this.bcryptService.comparePasswords(
      currentPassword,
      user.password,
    );
    if (!isMatch) {
      throw ApiException.badRequest('Current password is incorrect');
    }

    await this.updatePassword(user, newPassword);
  }
}
