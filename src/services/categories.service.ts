import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budget } from 'src/entities/budget.entity';
import { CategoryGroup } from 'src/entities/category-group.entity';
import { Category } from 'src/entities/category.entity';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from 'src/validation/category.schema';
import { In, Not, Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CategoryGroup)
    private readonly categoryGroupRepository: Repository<CategoryGroup>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
  ) {}

  async createCategory(dto: CreateCategoryDto, user: User) {
    const { name, groupId, budgetId } = dto;

    const categoryGroup = await this.categoryGroupRepository.findOne({
      where: { id: groupId },
    });

    if (!categoryGroup) {
      throw ApiException.notFound(`Category group does not exist`);
    }

    const budget = await this.budgetRepository.findOne({
      where: {
        id: budgetId,
        user: { id: user.id },
      },
      relations: ['user'],
    });

    if (!budget) {
      throw ApiException.notFound(
        `Budget does not exist or does not belong to the current user.`,
      );
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
        `Category already exists in the group for the specified budget.`,
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
      throw ApiException.notFound('Category does not exist');
    }

    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, user: User) {
    const { name } = dto;
    const category = await this.getCategory(id, user);

    const budgetExist = await this.categoryRepository.findOne({
      where: {
        id: Not(id),
        name,
        budget: {
          id: category.budget.id,
          user: {
            id: user.id,
          },
        },
      },
      withDeleted: true,
    });
    if (budgetExist) {
      throw ApiException.conflictError(
        'Category with this name already exist in this budget',
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
      throw ApiException.notFound(
        `Categories not found for IDs: ${notFoundIds.join(', ')}`,
      );
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
      throw ApiException.notFound(
        `Categories not found for IDs: ${notFoundIds.join(', ')}`,
      );
    }

    await this.categoryRepository.restore(ids);
  }
}
