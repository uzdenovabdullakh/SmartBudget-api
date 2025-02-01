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
import {
  RestoreAccountRequestDto,
  RestoreAccountRequestSchema,
} from 'src/validation/resrore-account-request.schema copy';
import {
  RestoreAccountDto,
  RestoreAccountSchema,
} from 'src/validation/restore-account.schema';
import { ErrorMessages } from 'src/constants/constants';
import { TranslationService } from 'src/services/translation.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly userService: UsersService,
    private readonly t: TranslationService,
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

    await this.mailService.sendMailByType(TokensType.ACTIVATE_ACCOUNT, {
      email,
      token,
      userName: user.login,
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
      throw ApiException.badRequest(ErrorMessages.INVALID_TOKEN);
    }

    await this.authService.activateUser(user, password);

    return { message: this.t.tMessage('confirmed', 'account') };
  }

  @Public()
  @Post('reset-password-request')
  @UsePipes(new ZodValidationPipe(ResetPasswordRequestSchema))
  async resetPasswordRequest(@Body() dto: ResetPasswordRequestDto) {
    const user = await this.userService.findOneByEmail(dto.email);

    const token = await this.authService.validateAndCreateToken(
      user,
      TokensType.RESET_PASSWORD,
    );

    await this.mailService.sendMailByType(TokensType.RESET_PASSWORD, {
      email: user.email,
      token,
      userName: user.login,
    });

    return { message: this.t.tMessage('email_sent', 'password_reset') };
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
      throw ApiException.badRequest(ErrorMessages.INVALID_TOKEN);
    }

    await this.authService.updatePassword(user, newPassword);

    return { message: this.t.tMessage('updated', 'password') };
  }

  @Patch('change-password')
  async changePassword(
    @Req() req: AuthenticationRequest,
    @Body(new ZodValidationPipe(ChangePasswordSchema)) dto: ChangePasswordDto,
  ) {
    const user = req.user;
    await this.authService.changePassword(user, dto);
    return { message: this.t.tMessage('updated', 'password') };
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

    const token = await this.authService.validateAndCreateToken(user, type);

    await this.mailService.sendMailByType(type, {
      email,
      token,
      userName: user.login,
    });

    return { message: this.t.tMessage('email_sent', 'new') };
  }

  @Public()
  @Post('restore-request')
  @UsePipes(new ZodValidationPipe(RestoreAccountRequestSchema))
  async restoreAccountRequest(@Body() dto: RestoreAccountRequestDto) {
    const user = await this.userService.findOneByEmail(dto.email);

    const token = await this.authService.validateAndCreateToken(
      user,
      TokensType.RESTORE_ACCOUNT,
    );

    await this.mailService.sendMailByType(TokensType.RESTORE_ACCOUNT, {
      email: user.email,
      token,
      userName: user.login,
    });

    return { message: this.t.tMessage('email_sent', 'restore_account') };
  }

  @Public()
  @Post('restore-account')
  @UsePipes(new ZodValidationPipe(RestoreAccountSchema))
  async restoreAccount(@Body() dto: RestoreAccountDto) {
    const { token } = dto;

    const user = await this.authService.verifyToken(
      token,
      TokensType.RESTORE_ACCOUNT,
    );
    if (!user) {
      throw ApiException.badRequest(ErrorMessages.INVALID_TOKEN);
    }

    await this.userService.restore(user.email);

    return { message: this.t.tMessage('restored', 'account') };
  }
}
