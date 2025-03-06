import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslationService } from './translation.service';
import { Budget } from 'src/entities/budget.entity';
import { Goal } from 'src/entities/goal.entity';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import {
  CreateGoalDto,
  GetGoalQuery,
  UpdateGoalDto,
} from 'src/validation/goal.schema';
import { Repository } from 'typeorm';
import { calculateSavings } from 'src/utils/helpers';
import { GetGoalFilter } from 'src/constants/enums';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    private readonly t: TranslationService,
  ) {}

  async createGoal(dto: { budgetId: string } & CreateGoalDto, user: User) {
    await this.goalRepository.manager.transaction(async (manager) => {
      const goalRepository = manager.getRepository(Goal);
      const budgetRepository = manager.getRepository(Budget);

      const { budgetId } = dto;

      const goal = goalRepository.create(dto);

      if (budgetId) {
        const budget = await budgetRepository.findOne({
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

      await goalRepository.save(goal);
    });
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
      select: ['id', 'achieveDate', 'currentAmount', 'name', 'targetAmount'],
      relations: ['budget'],
    });
    if (!goal) {
      throw ApiException.notFound(this.t.tException('not_found', 'goal'));
    }

    const savings = calculateSavings({
      target: goal.targetAmount,
      alreadySaved: goal.currentAmount,
      achieveDate: new Date(goal.achieveDate),
    });

    return { goal, savings };
  }

  async getGoals(id: string, query: GetGoalQuery, user: User) {
    const { filter } = query;

    const queryBuilder = this.goalRepository
      .createQueryBuilder('goal')
      .leftJoinAndSelect('goal.budget', 'budget')
      .where('budget.id = :budgetId', { budgetId: id })
      .andWhere('budget.user.id = :userId', { userId: user.id })
      .select([
        'goal.id',
        'goal.achieveDate',
        'goal.currentAmount',
        'goal.name',
        'goal.targetAmount',
        'goal.updatedAt',
      ])
      .orderBy('goal.updatedAt', 'DESC');

    if (filter === GetGoalFilter.ACTIVE) {
      queryBuilder.andWhere('goal.currentAmount < goal.targetAmount');
    } else if (filter === GetGoalFilter.REACHED) {
      queryBuilder.andWhere('goal.currentAmount >= goal.targetAmount');
    }

    const goals = await queryBuilder.getMany();

    return goals;
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
  }

  async removeGoal(id: string, user: User) {
    await this.getGoal(id, user);

    await this.goalRepository.delete(id);
  }
}
