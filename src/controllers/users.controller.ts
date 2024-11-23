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
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from 'src/services/users.service';
import { CreateUserDto } from 'src/types/dto/create-user.dto';
import { RestoreUserDto } from 'src/types/dto/restore-user.dto';
import { UpdateUserDto } from 'src/types/dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
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
    @Body() dto: UpdateUserDto,
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
  async restore(@Res() res: Response, @Body() dto: RestoreUserDto) {
    await this.usersService.restore(dto);
    return res.status(HttpStatus.OK).send({
      message: 'User was successfully restored',
    });
  }
}
