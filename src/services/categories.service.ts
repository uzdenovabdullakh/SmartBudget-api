import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslationService } from './translation.service';
import { CategoryGroup } from 'src/entities/category-group.entity';
import { Category } from 'src/entities/category.entity';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import {
  AssigningChangeDto,
  CreateCategoryDto,
  MoveAvaliableDto,
  ReorderCategoriesDto,
  UpdateCategoryDto,
} from 'src/validation/category.schema';
import { EntityManager, Equal, In, Not, Repository } from 'typeorm';
import { Account } from 'src/entities/account.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CategoryGroup)
    private readonly categoryGroupRepository: Repository<CategoryGroup>,
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
      select: ['id', 'name', 'assigned', 'available', 'spent'],
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
          available: category.available - newAmount,
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
          available: fromCategory.available - amount,
        });

        await categoryRepository.update(to, {
          available: toCategory.available + amount,
        });
      },
    );
  }

  async bulkFindOrCreate(
    categories: {
      name: string;
      user: User;
      account: Account;
      groupName?: string;
    }[],
    manager: EntityManager,
  ): Promise<Category[]> {
    if (!categories.length) return [];

    const categoryRepository = manager.getRepository(Category);
    const categoryGroupRepository = manager.getRepository(CategoryGroup);

    const uniqueCategories = new Map();
    const uniqueGroups = new Map();

    for (const { name, groupName, account } of categories) {
      const groupKey = groupName ?? name;
      uniqueCategories.set(name, groupKey);
      uniqueGroups.set(groupKey, account.budget);
    }

    const existingGroups = await categoryGroupRepository.find({
      where: { name: In([...uniqueGroups.keys()]) },
    });
    const existingGroupMap = new Map(existingGroups.map((g) => [g.name, g]));

    const newGroups = [...uniqueGroups.entries()]
      .filter(([name]) => !existingGroupMap.has(name))
      .map(([name, budget]) => ({ name, budget }));

    const insertedGroups = await categoryGroupRepository.save(newGroups);
    insertedGroups.forEach((group) => existingGroupMap.set(group.name, group));

    const existingCategories = await categoryRepository.find({
      where: { name: In([...uniqueCategories.keys()]) },
      relations: ['group'],
    });
    const existingCategoryMap = new Map(
      existingCategories.map((c) => [c.name, c]),
    );

    const newCategories = [...uniqueCategories.entries()]
      .filter(([name]) => !existingCategoryMap.has(name))
      .map(([name, groupName]) => ({
        name,
        group: existingGroupMap.get(groupName),
      }));

    const insertedCategories = await categoryRepository.save(newCategories);
    insertedCategories.forEach((c) => existingCategoryMap.set(c.name, c));

    return [...existingCategoryMap.values()];
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

        await categoryRepository.delete(id);
      },
    );
  }
}
