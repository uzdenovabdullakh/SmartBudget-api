import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budget } from 'src/entities/budget.entity';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import { CreateBudgetDto, UpdateBudgetDto } from 'src/validation/budget.schema';
import { In, IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
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
      throw ApiException.conflictError('Budget with this name already exsist');
    }

    const budget = this.budgetRepository.create({
      ...data,
      user,
    });
    const { user: budgetUser, ...newBudget } =
      await this.budgetRepository.save(budget);
    return newBudget;
  }

  async getUserBudgets(user: User) {
    return await this.budgetRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
    });
  }

  async getUserBudget(id: string, user: User) {
    const budget = await this.budgetRepository.findOne({
      where: {
        id,
        user: {
          id: user.id,
        },
      },
    });
    if (!budget) {
      throw ApiException.notFound('Budget not found');
    }
    return budget;
  }

  async getRemovedBudgets(user: User) {
    return await this.budgetRepository.find({
      where: {
        user: {
          id: user.id,
        },
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
    });
  }

  async updateBudget(id: string, data: UpdateBudgetDto, user: User) {
    const { name, settings } = data;
    await this.getUserBudget(id, user);

    const budgetExist = await this.budgetRepository.findOne({
      where: {
        id: Not(id),
        name,
        user: {
          id: user.id,
        },
      },
      withDeleted: true,
    });
    if (budgetExist) {
      throw ApiException.conflictError('Budget with this name already exsist');
    }

    await this.budgetRepository.update(
      {
        id,
      },
      { name, settings },
    );
    return await this.getUserBudget(id, user);
  }

  async deleteBudget(id: string, user: User) {
    await this.getUserBudget(id, user);

    await this.budgetRepository.softDelete({
      id,
      user,
    });
  }

  async deleteForever(ids: string[], user: User) {
    const budgets = await this.budgetRepository.find({
      where: {
        id: In(ids),
        user: { id: user.id },
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
    });

    const foundIds = budgets.map((budget) => budget.id);
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));
    if (notFoundIds.length > 0) {
      throw ApiException.notFound(
        `Budgets not found for IDs: ${notFoundIds.join(', ')}`,
      );
    }

    await this.budgetRepository.delete(ids);
  }

  async restoreBudgets(ids: string[], user: User) {
    const budgets = await this.budgetRepository.find({
      where: {
        id: In(ids),
        user: { id: user.id },
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
    });

    const foundIds = budgets.map((budget) => budget.id);
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));
    if (notFoundIds.length > 0) {
      throw ApiException.notFound(
        `Budgets not found for IDs: ${notFoundIds.join(', ')}`,
      );
    }

    await this.budgetRepository.restore(ids);
  }
}
