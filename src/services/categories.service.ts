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
  AssigningChangeDto,
  CategoryLimitDto,
  CreateCategoryDto,
  MoveAvaliableDto,
  ReorderCategoriesDto,
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
      relations: ['group', 'group.budget'],
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
      relations: ['group', 'group.budget'],
    });
    if (!category) {
      throw ApiException.notFound(this.t.tException('not_found', 'category'));
    }

    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, user: User) {
    const category = await this.getCategory(id, user);

    // Проверяем уникальность имени, если оно передано
    if (dto.name) {
      const categoryExist = await this.categoryRepository.findOne({
        where: {
          id: Not(id),
          name: Equal(dto.name),
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
    }

    const updateData: Partial<Category> = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.groupId) updateData.group = { id: dto.groupId } as any;

    if (Object.keys(updateData).length > 0) {
      await this.categoryRepository.update({ id }, updateData);
    }
  }

  async reorderCategories(dto: ReorderCategoriesDto) {
    await this.categoryRepository.manager.connection.transaction(
      async (manager) => {
        for (const category of dto.categories) {
          await manager.getRepository(Category).update(category.id, {
            order: category.order,
            group: { id: category.groupId },
          });
        }
      },
    );
  }

  async getDefaultCategory(budgetId: string, user: User) {
    const translatedCategoryName = this.t.tCategories(
      'Inflow: Ready to Assign',
      'names',
    );

    const defaultCategory = await this.categoryRepository.findOne({
      where: {
        name: translatedCategoryName,
        group: {
          budget: {
            id: budgetId,
            user: {
              id: user.id,
            },
          },
        },
      },
      select: ['id', 'name', 'assigned', 'available', 'activity'],
    });

    return defaultCategory;
  }

  async assigningChange(id: string, dto: AssigningChangeDto, user: User) {
    await this.categoryRepository.manager.connection.transaction(
      async (manager) => {
        const categoryRepository = manager.getRepository(Category);

        const category = await this.getCategory(id, user);

        const newAmount = dto.assigned - category.assigned;

        await categoryRepository.update(category.id, {
          assigned: category.assigned + newAmount,
          available: category.available + newAmount,
        });

        const defaultCategory = await this.getDefaultCategory(
          category.group.budget.id,
          user,
        );

        await categoryRepository.update(defaultCategory.id, {
          available: defaultCategory.available - newAmount,
        });
      },
    );
  }

  async moveAvailable(dto: MoveAvaliableDto, user: User) {
    const { from, to, amount } = dto;
    await this.categoryRepository.manager.connection.transaction(
      async (manager) => {
        const categoryRepository = manager.getRepository(Category);

        const fromCategory = await this.getCategory(from, user);
        const toCategory = await this.getCategory(to, user);

        await categoryRepository.update(from, {
          assigned: fromCategory.assigned - amount,
          available: fromCategory.available - amount,
        });

        await categoryRepository.update(to, {
          assigned: toCategory.assigned + amount,
          available: toCategory.available + amount,
        });
      },
    );
  }

  async removeCategory(id: string, user: User) {
    await this.categoryRepository.manager.connection.transaction(
      async (manager) => {
        const categoryRepository = manager.getRepository(Category);

        const category = await this.getCategory(id, user);

        const defaultCategory = await this.getDefaultCategory(
          category.group.budget.id,
          user,
        );

        await categoryRepository.update(defaultCategory.id, {
          available: defaultCategory.available + category.available,
        });

        await categoryRepository.update(id, {
          assigned: 0,
          activity: 0,
          available: 0,
        });
        await categoryRepository.softDelete(id);
      },
    );
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
