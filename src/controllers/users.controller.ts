import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UsePipes,
  Req,
} from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { UsersService } from 'src/services/users.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import {
  RestoreUserDto,
  RestoreUserSchema,
  UpdateUserDto,
  UpdateUserSchema,
} from 'src/validation/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findOne(@Req() req: AuthenticationRequest) {
    const user = await this.usersService.findOne(req.user.id);
    return user;
  }

  @Patch()
  @UsePipes(new ZodValidationPipe(UpdateUserSchema))
  async update(@Req() req: AuthenticationRequest, @Body() dto: UpdateUserDto) {
    const data = await this.usersService.update(req.user.id, dto);
    return {
      data,
      message: 'User was successfully updated',
    };
  }

  @Delete()
  async remove(@Req() req: AuthenticationRequest) {
    await this.usersService.remove(req.user.id);
    return {
      message: 'User was successfully removed',
    };
  }

  @Public()
  @Post('restore')
  @UsePipes(new ZodValidationPipe(RestoreUserSchema))
  async restore(@Body() dto: RestoreUserDto) {
    await this.usersService.restore(dto);
    return {
      message: 'User was successfully restored',
    };
  }
}
