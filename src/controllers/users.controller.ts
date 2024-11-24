import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Res,
  HttpStatus,
  UsePipes,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { Public } from 'src/decorators/public.decorator';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { UsersService } from 'src/services/users.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import { RestoreUserDto } from 'src/types/dto/restore-user.dto';
import { UpdateUserDto } from 'src/types/dto/update-user.dto';
import { RestoreUserSchema } from 'src/validation/restore-user.schema';
import { UpdateUserSchema } from 'src/validation/update-user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findOne(@Req() req: AuthenticationRequest, @Res() res: Response) {
    const user = await this.usersService.findOne(req.user.id);
    return res.status(HttpStatus.OK).send(user);
  }

  @Patch()
  async update(
    @Req() req: AuthenticationRequest,
    @Res() res: Response,
    @Body(new ZodValidationPipe(UpdateUserSchema)) dto: UpdateUserDto,
  ) {
    const data = await this.usersService.update(req.user.id, dto);
    return res.status(HttpStatus.OK).send({
      data,
      message: 'User was successfully updated',
    });
  }

  @Delete()
  async remove(@Req() req: AuthenticationRequest, @Res() res: Response) {
    await this.usersService.remove(req.user.id);
    return res.status(HttpStatus.OK).send({
      message: 'User was successfully removed',
    });
  }

  @Public()
  @Post('restore')
  @UsePipes(new ZodValidationPipe(RestoreUserSchema))
  async restore(@Res() res: Response, @Body() dto: RestoreUserDto) {
    await this.usersService.restore(dto);
    return res.status(HttpStatus.OK).send({
      message: 'User was successfully restored',
    });
  }
}
