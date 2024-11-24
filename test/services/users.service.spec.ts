import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/services/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { describe, beforeEach, it, expect, vi } from 'vitest';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    restore: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findOne method in repository', async () => {
    const userId = '123';
    mockUserRepository.findOne.mockResolvedValue({
      id: userId,
      email: 'test@example.com',
    });

    const result = await service.findOne(userId);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { id: userId },
      select: ['id', 'login', 'email', 'settings', 'isActivated'],
    });
    expect(result).toEqual({ id: userId, email: 'test@example.com' });
  });
});
