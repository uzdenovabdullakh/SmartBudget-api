import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import { CreateUserDto } from 'src/types/dto/create-user.dto';
import { RestoreUserDto } from 'src/types/dto/restore-user.dto';
import { UpdateUserDto } from 'src/types/dto/update-user.dto';
import { UserInfo } from 'src/types/user.types';
import { Not, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserInfo> {
    const findUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (findUser) {
      throw ApiException.badRequest('User already exist!');
    }

    const user = this.userRepository.create(dto);
    await this.userRepository.save(user);

    return await this.findOne(user.id);
  }

  async findOne(id: string): Promise<UserInfo> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'login', 'email', 'settings', 'isActivated'],
    });
    if (!user) throw ApiException.notFound('User not found!');

    delete user.password;
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserInfo> {
    await this.findOne(id);

    if (dto.email) {
      const existEmail = await this.userRepository.findOne({
        where: {
          email: dto.email,
          id: Not(id),
        },
      });
      if (existEmail)
        throw ApiException.badRequest('User with this email already exist!');
    }

    await this.userRepository.update({ id }, dto);

    const userInfo = await this.findOne(id);
    return userInfo;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.userRepository.softDelete({ id });
  }

  async restore(dto: RestoreUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
      withDeleted: true,
    });
    if (!user) throw ApiException.notFound('User not found!');

    await this.userRepository.restore({
      id: user.id,
    });
  }
}
