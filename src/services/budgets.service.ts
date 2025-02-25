import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslationService } from './translation.service';
import { Budget } from 'src/entities/budget.entity';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import { CreateBudgetDto, UpdateBudgetDto } from 'src/validation/budget.schema';
import { Equal, Not, Repository } from 'typeorm';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    private readonly t: TranslationService,
  ) {}

  async createBudget(data: CreateBudgetDto, user: User) {
    const budgetExist = await this.budgetRepository.findOne({
      where: {
        name: data.name,
        user: {
          id: user.id,
        },
      },
      withDeleted: true,
    });
    if (budgetExist) {
      throw ApiException.conflictError(
        this.t.tException('already_exists', 'budget'),
      );
    }

    const budget = this.budgetRepository.create({
      ...data,
      user,
    });
    await this.budgetRepository.save(budget);
  }

  async getUserBudgets(user: User) {
    return await this.budgetRepository.find({
      select: ['id', 'name', 'createdAt', 'settings'],
      where: {
        user: {
          id: user.id,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async getUserBudget(id: string, user: User) {
    const budget = await this.budgetRepository.findOne({
      select: ['id', 'name', 'createdAt', 'settings'],
      where: {
        id,
        user: {
          id: user.id,
        },
      },
    });
    if (!budget) {
      throw ApiException.notFound(this.t.tException('not_found', 'budget'));
    }
    return budget;
  }

  async updateBudget(id: string, data: UpdateBudgetDto, user: User) {
    const { name, settings } = data;
    await this.getUserBudget(id, user);

    const budgetExist = await this.budgetRepository.findOne({
      where: {
        id: Not(id),
        name: Equal(name),
        user: {
          id: user.id,
        },
      },
      withDeleted: true,
    });
    if (budgetExist) {
      throw ApiException.conflictError(
        this.t.tException('already_exists', 'budget'),
      );
    }

    await this.budgetRepository.update(
      {
        id,
      },
      { name, settings },
    );
  }

  async deleteBudget(id: string, user: User) {
    await this.getUserBudget(id, user);

    await this.budgetRepository.delete({
      id,
      user,
    });
  }
}
