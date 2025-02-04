import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslationService } from './translation.service';
import { Budget } from 'src/entities/budget.entity';
import { Category } from 'src/entities/category.entity';
import { Goal } from 'src/entities/goal.entity';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import { CreateGoalDto, UpdateGoalDto } from 'src/validation/goal.schema';
import { Repository } from 'typeorm';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly t: TranslationService,
  ) {}

  async createGoal(dto: CreateGoalDto, user: User) {
    const { budgetId, categoryId } = dto;

    const goal = this.goalRepository.create(dto);

    if (budgetId) {
      const budget = await this.budgetRepository.findOne({
        where: {
          id: budgetId,
          user: { id: user.id },
        },
        relations: ['user'],
      });

      if (!budget) {
        throw ApiException.notFound(this.t.tException('not_found', 'budget'));
      }

      goal.budget = budget;
    }

    if (categoryId) {
      const category = await this.categoryRepository.findOne({
        where: {
          id: categoryId,
          budget: {
            user: {
              id: user.id,
            },
          },
        },
        relations: ['user'],
      });

      if (!category) {
        throw ApiException.notFound(this.t.tException('not_found', 'category'));
      }

      category.goal = goal;
      await this.categoryRepository.save(category);
    }

    const newGoal = await this.goalRepository.save(goal);
    return await this.getGoal(newGoal.id, user);
  }

  async getGoal(id: string, user: User) {
    const goal = await this.goalRepository.findOne({
      where: {
        id,
        budget: {
          user: {
            id: user.id,
          },
        },
      },
    });
    if (!goal) {
      throw ApiException.notFound(this.t.tException('not_found', 'goal'));
    }

    return goal;
  }

  async updateGoal(id: string, dto: UpdateGoalDto, user: User) {
    await this.getGoal(id, user);

    await this.goalRepository.update(
      {
        id,
      },
      {
        ...dto,
      },
    );
    return await this.getGoal(id, user);
  }

  async removeGoal(id: string, user: User) {
    await this.getGoal(id, user);

    await this.goalRepository.delete(id);
  }
}
