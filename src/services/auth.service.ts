import { Injectable } from '@nestjs/common';
import { TokensType } from 'src/constants/enums';
import { Repository } from 'typeorm';
import { Token } from 'src/entities/token.entity';
import { User } from 'src/entities/user.entity';
import { JwtTokenService } from './jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { BcryptService } from './bcrypt.service';
import { ApiException } from 'src/exceptions/api.exception';
import { ErrorCodes, tokenLifeTime } from 'src/constants/constants';
import { ChangePasswordDto } from 'src/validation/change-password.schema';
import { parseDuration } from 'src/utils/helpers';
import { TranslationService } from './translation.service';
import { OauthDto } from 'src/validation/oauth.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtTokenService,
    private readonly bcryptService: BcryptService,
    private readonly t: TranslationService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      withDeleted: true,
    });

    if (!user || !user.password) return null;

    const isPasswordValid = await this.bcryptService.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      return null;
    }

    if (user.deletedAt) {
      throw ApiException.conflictError(
        this.t.tException('user_is_deleted'),
        ErrorCodes.USER_DELETED,
      );
    }

    return user;
  }

  async generateTokensToResponse(user: User) {
    const { id, email, login, isActivated } = user;
    const accessToken = await this.jwtService.generateToken(
      { id, email, login, isActivated },
      '15m',
    );
    const refreshToken = await this.createToken(user, TokensType.REFRESH_TOKEN);

    return { accessToken, refreshToken };
  }

  async createToken(user: User, tokenType: TokensType): Promise<string> {
    const { id, email, login, isActivated } = user;
    const token = await this.jwtService.generateToken(
      { id, email, login, isActivated },
      tokenLifeTime[tokenType],
    );

    const expirationDuration = parseDuration(tokenLifeTime[tokenType]);
    const expirationTime = new Date(Date.now() + expirationDuration);

    const tokenEntity = new Token(user, token, tokenType, expirationTime);

    if (tokenType == TokensType.REFRESH_TOKEN) {
      const userTokens = await this.tokenRepository.find({
        where: { user: { id: user.id }, tokenType: TokensType.REFRESH_TOKEN },
        relations: ['user'],
      });

      if (userTokens.length >= 3) {
        await this.tokenRepository.remove(
          userTokens.slice(0, userTokens.length - 2),
        );
      }
    }
    await this.tokenRepository.save(tokenEntity);

    return token;
  }

  async validateAndCreateToken(user: User, type: TokensType): Promise<string> {
    const tokenCount = user.tokens.filter(
      (item) => item.tokenType === type,
    ).length;

    if (tokenCount > 3) {
      throw ApiException.badRequest(
        this.t.tException('too_many_requests'),
        ErrorCodes.TOO_MANY_REQUESTS,
      );
    }

    return await this.createToken(user, type);
  }

  async refreshTokens(refreshToken: string) {
    const tokenEntity = await this.tokenRepository.findOne({
      where: { token: refreshToken, tokenType: TokensType.REFRESH_TOKEN },
      relations: ['user'],
    });

    if (!tokenEntity) {
      throw ApiException.unauthorized(
        this.t.tException('invalid_refresh_token'),
      );
    }

    const isValid = await this.jwtService.validateToken(refreshToken);
    if (!isValid) {
      await this.tokenRepository.delete(tokenEntity);
      throw ApiException.unauthorized(
        this.t.tException('invalid_refresh_token'),
      );
    }

    return await this.generateTokensToResponse(tokenEntity.user);
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

  async changePassword(user: User, dto: ChangePasswordDto) {
    const { newPassword, currentPassword } = dto;

    const isMatch = await this.bcryptService.comparePasswords(
      currentPassword,
      user.password,
    );
    if (!isMatch) {
      throw ApiException.badRequest(
        this.t.tException('password_did_not_match'),
      );
    }

    await this.updatePassword(user, newPassword);
  }

  async logout(user: User, refreshToken: string) {
    const tokenEntity = await this.tokenRepository.findOne({
      where: { token: refreshToken, user: { id: user.id } },
      relations: ['user'],
    });

    if (tokenEntity) {
      await this.tokenRepository.remove(tokenEntity);
    }
  }

  async oauth(dto: OauthDto) {
    const { yandexId, email, login } = dto;

    const userWithYandexId = await this.userRepository.findOne({
      where: { yandexId },
    });

    if (userWithYandexId) {
      return this.generateTokensToResponse(userWithYandexId);
    }

    const userWithEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (userWithEmail) {
      throw ApiException.badRequest(
        this.t.tException('already_exists', 'user'),
      );
    }

    const user = this.userRepository.create({
      email,
      login,
      yandexId,
      isActivated: true,
    });
    await this.userRepository.save(user);

    return this.generateTokensToResponse(user);
  }
}
