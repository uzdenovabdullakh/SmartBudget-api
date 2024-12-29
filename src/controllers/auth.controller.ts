import {
  Controller,
  Post,
  Body,
  UsePipes,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TokensType } from 'src/constants/enums';
import { Public } from 'src/decorators/public.decorator';
import { ApiException } from 'src/exceptions/api.exception';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { AuthService } from 'src/services/auth.service';
import { MailService } from 'src/services/mail.service';
import { UsersService } from 'src/services/users.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import {
  ChangePasswordDto,
  ChangePasswordSchema,
} from 'src/validation/change-password.schema';
import {
  ConfirmSignUpDto,
  ConfirmSignUpSchema,
} from 'src/validation/confirm-signup.schema';
import { CreateUserDto, CreateUserSchema } from 'src/validation/user.schema';
import {
  ResetPasswordRequestDto,
  ResetPasswordRequestSchema,
} from 'src/validation/reset-password-request.schema';
import {
  ResetPasswordDto,
  ResetPasswordSchema,
} from 'src/validation/reset-password.schema';
import { TokenDto, TokenSchema } from 'src/validation/token.schema';
import {
  ResendEmailSchema,
  ResendEmailDto,
} from 'src/validation/resend-email.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly userService: UsersService,
  ) {}

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: AuthenticationRequest) {
    const user = req.user;
    return await this.authService.generateTokensToResponse(user);
  }

  @Public()
  @Post('refresh-token')
  @UsePipes(new ZodValidationPipe(TokenSchema))
  async refreshTokens(@Body() dto: TokenDto) {
    const tokens = await this.authService.refreshTokens(dto.refreshToken);
    return tokens;
  }

  @Public()
  @Post('signup')
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async signup(@Body() dto: CreateUserDto) {
    const { email, login } = dto;
    const user = await this.userService.create(dto);

    const token = await this.authService.createToken(
      user,
      TokensType.ACTIVATE_ACCOUNT,
    );

    await this.mailService.sendInvite({
      email,
      token,
      userName: login,
    });

    return { email, login };
  }

  @Public()
  @Post('confirm')
  @UsePipes(new ZodValidationPipe(ConfirmSignUpSchema))
  async confirm(@Body() dto: ConfirmSignUpDto) {
    const { password, token } = dto;
    const user = await this.authService.verifyToken(
      token,
      TokensType.ACTIVATE_ACCOUNT,
    );

    if (!user) {
      throw ApiException.badRequest('Invalid or expired token');
    }

    await this.authService.activateUser(user, password);

    return { message: 'Account confirmed successfully' };
  }

  @Public()
  @Post('reset-password-request')
  @UsePipes(new ZodValidationPipe(ResetPasswordRequestSchema))
  async resetPasswordRequest(@Body() dto: ResetPasswordRequestDto) {
    const user = await this.userService.findOneByEmail(dto.email);

    if (
      user.tokens.length &&
      user.tokens.find((item) => item.tokenType === TokensType.RESET_PASSWORD)
    ) {
      throw ApiException.badRequest(
        'Reset password email already send. Check your mail box, or resend email',
      );
    }

    const token = await this.authService.createToken(
      user,
      TokensType.RESET_PASSWORD,
    );

    await this.mailService.resetPassword({
      email: dto.email,
      token,
      userName: user.login,
    });

    return { message: 'Password reset email sent' };
  }

  @Public()
  @Post('reset-password')
  @UsePipes(new ZodValidationPipe(ResetPasswordSchema))
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const { token, newPassword } = dto;
    const user = await this.authService.verifyToken(
      token,
      TokensType.RESET_PASSWORD,
    );
    if (!user) {
      throw ApiException.badRequest('Invalid or expired token');
    }

    await this.authService.updatePassword(user, newPassword);

    return { message: 'Password updated successfully' };
  }

  @Patch('change-password')
  async changePassword(
    @Req() req: AuthenticationRequest,
    @Body(new ZodValidationPipe(ChangePasswordSchema)) dto: ChangePasswordDto,
  ) {
    const user = req.user;
    await this.authService.changePassword(user, dto);
    return { message: 'Password changed successfully' };
  }

  @Post('logout')
  @UsePipes(new ZodValidationPipe(TokenSchema))
  async logout(@Req() req: AuthenticationRequest, @Body() dto: TokenDto) {
    const user = req.user;
    await this.authService.logout(user, dto.refreshToken);
  }

  @Public()
  @Post('resend-email')
  @UsePipes(new ZodValidationPipe(ResendEmailSchema))
  async resendEmail(@Body() dto: ResendEmailDto) {
    const { email, type } = dto;

    const user = await this.userService.findOneByEmail(email);

    if (
      user.tokens.length &&
      user.tokens.filter((item) => item.tokenType === (type as TokensType))
        .length > 3
    ) {
      throw ApiException.badRequest(
        'Reset password email already send. Check your email box',
      );
    }

    const token = await this.authService.createToken(user, type as TokensType);

    if (type === TokensType.ACTIVATE_ACCOUNT) {
      await this.mailService.sendInvite({
        email,
        token,
        userName: user.login,
      });
    } else {
      await this.mailService.resetPassword({
        email,
        token,
        userName: user.login,
      });
    }

    return { message: 'New email successfully sent' };
  }
}
