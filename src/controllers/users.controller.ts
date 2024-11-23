import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  ParseUUIDPipe,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { UsersService } from 'src/services/users.service';
import { CreateUserDto } from 'src/types/dto/create-user.dto';
import { RestoreUserDto } from 'src/types/dto/restore-user.dto';
import { UpdateUserDto } from 'src/types/dto/update-user.dto';
import { CreateUserSchema } from 'src/validation/create-user.schema';
import { RestoreUserSchema } from 'src/validation/restore-user.schema';
import { UpdateUserSchema } from 'src/validation/update-user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async create(@Res() res: Response, @Body() dto: CreateUserDto) {
    const data = await this.usersService.create(dto);
    return res.status(HttpStatus.CREATED).send({
      data,
      message: 'User was successfully created',
    });
  }

  @Get(':id')
  async findOne(@Res() res: Response, @Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findOne(id);
    return res.status(HttpStatus.OK).send(user);
  }

  @Patch(':id')
  async update(
    @Res() res: Response,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) dto: UpdateUserDto,
  ) {
    const data = await this.usersService.update(id, dto);
    return res.status(HttpStatus.OK).send({
      data,
      message: 'User was successfully updated',
    });
  }

  @Delete(':id')
  async remove(@Res() res: Response, @Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.remove(id);
    return res.status(HttpStatus.OK).send({
      message: 'User was successfully removed',
    });
  }

  @Post('restore')
  @UsePipes(new ZodValidationPipe(RestoreUserSchema))
  async restore(@Res() res: Response, @Body() dto: RestoreUserDto) {
    await this.usersService.restore(dto);
    return res.status(HttpStatus.OK).send({
      message: 'User was successfully restored',
    });
  }
}
