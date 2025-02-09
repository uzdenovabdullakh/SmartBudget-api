import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslationService } from './translation.service';
import { ErrorCodes } from 'src/constants/constants';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import { UserInfo } from 'src/types/user.types';
import { CreateUserDto, UpdateUserDto } from 'src/validation/user.schema';
import { Equal, IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly t: TranslationService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const findUser = await this.userRepository.findOne({
      where: { email: dto.email },
      withDeleted: true,
    });
    if (findUser) {
      if (!findUser.isActivated) {
        throw ApiException.badRequest(
          this.t.tException('user_is_not_activated'),
          ErrorCodes.USER_NOT_ACTIVATED,
        );
      }
      throw ApiException.badRequest(
        this.t.tException('already_exists', 'user'),
      );
    }

    const user = this.userRepository.create(dto);
    await this.userRepository.save(user);

    return user;
  }

  async findOne(id: string): Promise<UserInfo> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'login', 'email', 'yandexId'],
      relations: ['brief'],
    });

    if (!user)
      throw ApiException.notFound(this.t.tException('not_found', 'user'));

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      yandexId: user.yandexId,
      isBriefCompleted: user?.brief?.isCompleted,
    };
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      relations: ['tokens'],
    });
    if (!user)
      throw ApiException.notFound(this.t.tException('not_found', 'user'));

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    if (dto.email) {
      const existEmail = await this.userRepository.findOne({
        where: {
          email: Equal(dto.email),
          id: Not(id),
        },
        withDeleted: true,
      });
      if (existEmail)
        throw ApiException.badRequest(
          this.t.tException('already_exists', 'user'),
        );
    }

    await this.userRepository.update({ id }, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.userRepository.softDelete({ id });
  }

  async restore(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
    });

    await this.userRepository.restore({
      id: user.id,
    });
  }
}
