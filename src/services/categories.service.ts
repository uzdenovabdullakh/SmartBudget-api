import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslationService } from './translation.service';
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
    @InjectRepository(CategorySpending)
    private readonly categorySpendingRepository: Repository<CategorySpending>,
    private readonly t: TranslationService,
  ) {}

  async createCategory(dto: CreateCategoryDto, user: User) {
    const { name, groupId } = dto;

    const categoryGroup = await this.categoryGroupRepository.findOne({
      where: { id: groupId },
    });
    if (!categoryGroup) {
      throw ApiException.notFound(
        this.t.tException('not_found', 'category_group'),
      );
    }

    const existingCategory = await this.categoryRepository.findOne({
      where: {
        name,
        group: {
          id: groupId,
          budget: { user: { id: user.id } },
        },
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
    });

    await this.categoryRepository.save(category);
  }

  async getCategory(id: string, user: User) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
        group: {
          budget: {
            user: {
              id: user.id,
            },
          },
        },
      },
      relations: ['group'],
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
        group: {
          id: category.group.id,
        },
      },
      withDeleted: true,
    });
    if (categoryExist) {
      throw ApiException.badRequest(
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
  }

  async removeCategory(id: string, user: User) {
    await this.getCategory(id, user);

    await this.categoryRepository.softDelete(id);
  }

  async deleteForever(ids: string[], user: User) {
    await this.categoryRepository.manager.transaction(async (manager) => {
      const categoryRepository = manager.getRepository(Category);

      const categories = await categoryRepository.find({
        where: {
          id: In(ids),
          group: {
            budget: {
              user: { id: user.id },
            },
          },
        },
        withDeleted: true,
      });

      const foundIds = categories.map((category) => category.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));
      if (notFoundIds.length > 0) {
        throw ApiException.notFound(this.t.tException('not_found', 'category'));
      }

      await categoryRepository.delete(ids);
    });
  }

  async restoreCategories(ids: string[], user: User) {
    await this.categoryRepository.manager.transaction(async (manager) => {
      const categoryRepository = manager.getRepository(Category);

      const categories = await categoryRepository.find({
        where: {
          id: In(ids),
          group: {
            budget: {
              user: { id: user.id },
            },
          },
        },
        withDeleted: true,
      });

      const foundIds = categories.map((category) => category.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));
      if (notFoundIds.length > 0) {
        throw ApiException.notFound(this.t.tException('not_found', 'category'));
      }

      await categoryRepository.restore(ids);
    });
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
  }
}
