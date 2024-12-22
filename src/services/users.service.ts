import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import { UserInfo } from 'src/types/user.types';
import {
  CreateUserDto,
  RestoreUserDto,
  UpdateUserDto,
} from 'src/validation/user.schema';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const findUser = await this.userRepository.findOne({
      where: { email: dto.email },
      withDeleted: true,
    });
    if (findUser) {
      if (!findUser.isActivated) {
        throw ApiException.badRequest(
          'User is not activated. Resend activation email!',
        );
      }
      throw ApiException.badRequest('User already exist!');
    }

    const user = this.userRepository.create(dto);
    await this.userRepository.save(user);

    return user;
  }

  async findOne(id: string): Promise<UserInfo> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'login', 'email', 'settings', 'isActivated'],
      relations: ['brief'],
    });

    if (!user) throw ApiException.notFound('User not found!');

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      settings: user.settings,
      isActivated: user.isActivated,
      isBriefCompleted: user.brief.isCompleted,
    };
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      relations: ['budgets'],
    });
    if (!user) throw ApiException.notFound('User not found!');

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
        withDeleted: true,
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
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
    });
    if (!user) throw ApiException.notFound('User not found!');

    await this.userRepository.restore({
      id: user.id,
    });
  }
}
