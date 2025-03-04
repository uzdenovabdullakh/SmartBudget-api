import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslationService } from './translation.service';
import { CategoryGroup } from 'src/entities/category-group.entity';
import { Category } from 'src/entities/category.entity';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import {
  CreateCategoryGroupDto,
  ReorderCategoryGroupsDto,
  UpdateCategoryGroupDto,
} from 'src/validation/category-group.schema';
import { Equal, Not, Repository } from 'typeorm';

@Injectable()
export class CategoryGroupsService {
  constructor(
    @InjectRepository(CategoryGroup)
    private readonly categoryGroupRepository: Repository<CategoryGroup>,
    private readonly t: TranslationService,
  ) {}

  async createCategoryGroup(dto: CreateCategoryGroupDto) {
    const { name, budgetId } = dto;
    const categoryGroupExist = await this.categoryGroupRepository.findOne({
      where: {
        name,
        budget: {
          id: budgetId,
        },
      },
      withDeleted: true,
    });
    if (categoryGroupExist) {
      throw ApiException.conflictError(
        this.t.tException('already_exists', 'category_group'),
      );
    }

    const createNewCategoryGroup = this.categoryGroupRepository.create({
      ...dto,
      budget: { id: budgetId },
    });
    await this.categoryGroupRepository.save(createNewCategoryGroup);
  }

  async getGroupsWithCategories(
    id: string,
    withDefault: boolean = false,
    user: User,
  ) {
    const translateDefaultGroup = this.t.tCategories('Inflow', 'groups');

    const queryBuilder = this.categoryGroupRepository
      .createQueryBuilder('categoryGroup')
      .leftJoinAndSelect('categoryGroup.categories', 'categories')
      .leftJoinAndSelect('categories.categorySpending', 'categoryLimit')
      .leftJoin('categoryGroup.budget', 'budget')
      .leftJoin('budget.user', 'user')
      .where('budget.id = :id', { id })
      .andWhere('user.id = :userId', { userId: user.id })
      .select([
        'categoryGroup.id',
        'categoryGroup.name',
        'categoryGroup.order',
        'categories.id',
        'categories.name',
        'categories.available',
        'categories.assigned',
        'categories.spent',
        'categories.order',
        'categoryLimit.limitAmount',
        'categoryLimit.spentAmount',
      ])
      .orderBy('categoryGroup.order', 'ASC')
      .addOrderBy('categoryGroup.createdAt', 'ASC')
      .addOrderBy('categories.order', 'ASC');

    if (!withDefault) {
      queryBuilder.andWhere('categoryGroup.name != :translateDefaultGroup', {
        translateDefaultGroup,
      });
    }

    const categories = await queryBuilder.getMany();

    return categories;
  }

  async removeCategoryGroup(id: string, user: User) {
    await this.categoryGroupRepository.manager.transaction(async (manager) => {
      const categoryGroupRepository = manager.getRepository(CategoryGroup);
      const categoryRepository = manager.getRepository(Category);

      const categoryGroupExist = await categoryGroupRepository.findOne({
        where: {
          id,
          budget: {
            user: {
              id: user.id,
            },
          },
        },
        relations: ['categories'],
      });

      if (!categoryGroupExist) {
        throw ApiException.notFound(
          this.t.tException('not_found', 'category_group'),
        );
      }

      await categoryGroupRepository.remove(categoryGroupExist);
      await categoryRepository.remove(categoryGroupExist.categories);
    });
  }

  async getCategoryGroup(id: string, user: User) {
    const categoryGroupExist = await this.categoryGroupRepository.findOne({
      where: {
        id,
        budget: {
          user: {
            id: user.id,
          },
        },
      },
      relations: ['budget'],
    });

    if (!categoryGroupExist) {
      throw ApiException.notFound(
        this.t.tException('not_found', 'category_group'),
      );
    }

    return categoryGroupExist;
  }

  async updateCategoryGroup(
    id: string,
    dto: UpdateCategoryGroupDto,
    user: User,
  ) {
    const categoryGroup = await this.getCategoryGroup(id, user);

    const categoryGroupExist = await this.categoryGroupRepository.findOne({
      where: {
        id: Not(id),
        name: Equal(dto.name),
        budget: {
          id: categoryGroup.budget.id,
        },
      },
      withDeleted: true,
    });
    if (categoryGroupExist) {
      throw ApiException.badRequest(
        this.t.tException('already_exists', 'categoryGroupExist'),
      );
    }

    await this.categoryGroupRepository.update(id, {
      ...dto,
    });
  }

  async reorderGroups(dto: ReorderCategoryGroupsDto) {
    await this.categoryGroupRepository.manager.connection.transaction(
      async (manager) => {
        for (const group of dto.groups) {
          await manager.getRepository(CategoryGroup).update(group.id, {
            order: group.order,
          });
        }
      },
    );
  }
}
