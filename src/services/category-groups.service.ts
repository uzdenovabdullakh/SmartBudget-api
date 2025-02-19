import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslationService } from './translation.service';
import { CategoryGroup } from 'src/entities/category-group.entity';
import { Category } from 'src/entities/category.entity';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import {
  CreateCategoryGroupDto,
  UpdateCategoryGroupDto,
} from 'src/validation/category-group.schema';
import { Equal, FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';

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

    const where: FindOptionsWhere<CategoryGroup> = {
      budget: {
        id,
        user: {
          id: user.id,
        },
      },
    };

    if (!withDefault) {
      where.name = Not(translateDefaultGroup);
    }

    const categories = await this.categoryGroupRepository.find({
      where,
      select: {
        id: true,
        name: true,
        categories: {
          id: true,
          name: true,
          available: true,
          assigned: true,
          activity: true,
        },
      },
      relations: ['categories'],
      order: {
        createdAt: 'ASC',
      },
    });

    return categories;
  }

  async getRemovedCategoriesGroup(user: User) {
    const categories = await this.categoryGroupRepository.find({
      where: {
        deletedAt: Not(IsNull()),
        budget: {
          user: {
            id: user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        budget: {
          id: true,
          name: true,
        },
        categories: {
          id: true,
          name: true,
        },
      },
      relations: ['categories'],
      withDeleted: true,
    });

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

      await categoryGroupRepository.softRemove(categoryGroupExist);
      await categoryRepository.softRemove(categoryGroupExist.categories);
    });
  }

  async restoreCategoryGroup(id: string, user: User) {
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
        withDeleted: true,
      });

      if (!categoryGroupExist) {
        throw ApiException.notFound(
          this.t.tException('not_found', 'category_group'),
        );
      }

      await categoryGroupRepository.restore(id);
      await categoryRepository.recover(categoryGroupExist.categories);
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
}
