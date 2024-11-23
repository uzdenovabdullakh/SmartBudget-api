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
import { UpdateUserDto } from 'src/types/dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Res() res: Response, @Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return res.status(HttpStatus.CREATED).send({
      user,
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
    const user = await this.usersService.update(id, dto);
    return res.status(HttpStatus.OK).send({
      user,
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
}
