import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from 'src/controllers/users.controller';
import { UsersService } from 'src/services/users.service';
import { describe, beforeEach, it, expect } from 'vitest';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
