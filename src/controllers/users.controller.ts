import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  UsePipes,
  Req,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { TranslationService } from 'src/services/translation.service';
import { UsersService } from 'src/services/users.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import { UpdateUserDto, UpdateUserSchema } from 'src/validation/user.schema';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly t: TranslationService,
  ) {}

  @Get()
  async findOne(@Req() req: AuthenticationRequest) {
    const user = await this.usersService.findOne(req.user.id);
    return user;
  }

  @Patch()
  @UsePipes(new ZodValidationPipe(UpdateUserSchema))
  async update(@Req() req: AuthenticationRequest, @Body() dto: UpdateUserDto) {
    await this.usersService.update(req.user.id, dto);
    return {
      message: this.t.tMessage('updated', 'user'),
    };
  }

  @Delete()
  async remove(@Req() req: AuthenticationRequest) {
    await this.usersService.remove(req.user.id);
    return {
      message: this.t.tMessage('removed', 'user'),
    };
  }
}
