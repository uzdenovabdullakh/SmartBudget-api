import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslationService } from './translation.service';
import { Budget } from 'src/entities/budget.entity';
import { CategoryGroup } from 'src/entities/category-group.entity';
import { CategorySpending } from 'src/entities/category-spending.entity';
import { Category } from 'src/entities/category.entity';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import { calculatePeriod } from 'src/utils/helpers';
import {
  CategoryLimitDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from 'src/validation/category.schema';
import { Equal, In, Not, Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CategoryGroup)
    private readonly categoryGroupRepository: Repository<CategoryGroup>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(CategorySpending)
    private readonly categorySpendingRepository: Repository<CategorySpending>,
    private readonly t: TranslationService,
  ) {}

  async createCategory(dto: CreateCategoryDto, user: User) {
    const { name, groupId, budgetId } = dto;

    const categoryGroup = await this.categoryGroupRepository.findOne({
      where: { id: groupId },
    });

    if (!categoryGroup) {
      throw ApiException.notFound(
        this.t.tException('not_found', 'category_group'),
      );
    }

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

    const existingCategory = await this.categoryRepository.findOne({
      where: {
        name,
        budget: { id: budgetId },
        group: { id: groupId },
      },
      relations: ['budget', 'group'],
    });

    if (existingCategory) {
      throw ApiException.conflictError(
        this.t.tException('already_exists', 'category'),
      );
    }

    const category = this.categoryRepository.create({
      name,
      group: categoryGroup,
      budget: { id: budgetId },
    });

    const newCategory = await this.categoryRepository.save(category);
    return await this.getCategory(newCategory.id, user);
  }

  async getCategory(id: string, user: User) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
        budget: {
          user: {
            id: user.id,
          },
        },
      },
      select: {
        group: {
          id: true,
          name: true,
        },
      },
      relations: ['categorySpending', 'goal', 'group'],
    });
    if (!category) {
      throw ApiException.notFound(this.t.tException('not_found', 'category'));
    }

    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, user: User) {
    const { name } = dto;
    const category = await this.getCategory(id, user);

    const categoryExist = await this.categoryRepository.findOne({
      where: {
        id: Not(id),
        name: Equal(name),
        budget: {
          id: category.budget.id,
          user: {
            id: user.id,
          },
        },
      },
      withDeleted: true,
    });
    if (categoryExist) {
      throw ApiException.notFound(
        this.t.tException('already_exists', 'category'),
      );
    }

    await this.categoryRepository.update(
      {
        id,
      },
      {
        name,
      },
    );
    return await this.getCategory(id, user);
  }

  async removeCategory(id: string, user: User) {
    await this.getCategory(id, user);

    await this.categoryRepository.softDelete(id);
  }

  async deleteForever(ids: string[], user: User) {
    const categories = await this.categoryRepository.find({
      where: {
        id: In(ids),
        budget: {
          user: { id: user.id },
        },
      },
      withDeleted: true,
    });

    const foundIds = categories.map((category) => category.id);
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));
    if (notFoundIds.length > 0) {
      throw ApiException.notFound(this.t.tException('not_found', 'category'));
    }

    await this.categoryRepository.delete(ids);
  }

  async restoreCategories(ids: string[], user: User) {
    const categories = await this.categoryRepository.find({
      where: {
        id: In(ids),
        budget: {
          user: { id: user.id },
        },
      },
      withDeleted: true,
    });

    const foundIds = categories.map((category) => category.id);
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));
    if (notFoundIds.length > 0) {
      throw ApiException.notFound(this.t.tException('not_found', 'category'));
    }

    await this.categoryRepository.restore(ids);
  }

  async setCategoryLimit(id: string, dto: CategoryLimitDto, user: User) {
    const category = await this.getCategory(id, user);

    const { limitAmount, limitResetPeriod } = dto;

    const [periodStart, periodEnd] = calculatePeriod(limitResetPeriod);

    const categorySpending = this.categorySpendingRepository.create({
      category,
      limitAmount,
      limitResetPeriod,
      periodStart,
      periodEnd,
    });

    await this.categorySpendingRepository.save(categorySpending);
    return await this.getCategory(id, user);
  }
}
