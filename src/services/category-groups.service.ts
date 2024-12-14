import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryGroup } from 'src/entities/category-group.entity';
import { Category } from 'src/entities/category.entity';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import { CreateCategoryGroupDto } from 'src/validation/category-group.schema';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class CategoryGroupsService {
  constructor(
    @InjectRepository(CategoryGroup)
    private readonly categoryGroupRepository: Repository<CategoryGroup>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async createCategoryGroup(dto: CreateCategoryGroupDto) {
    const categoryGroupExist = await this.categoryGroupRepository.findOne({
      where: {
        name: dto.name,
      },
      withDeleted: true,
    });
    if (categoryGroupExist) {
      throw ApiException.conflictError('Category group with this name exist');
    }

    const createNewCategoryGroup = this.categoryGroupRepository.create(dto);
    await this.categoryGroupRepository.save(createNewCategoryGroup);

    return createNewCategoryGroup;
  }

  async getCategoriesGroups(id: string, user: User) {
    const categories = await this.categoryGroupRepository.find({
      where: {
        categories: {
          budget: {
            id,
            user: {
              id: user.id,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        categories: {
          id: true,
          name: true,
        },
      },
      relations: ['categories'],
    });

    return categories;
  }

  async getRemovedCategoriesGroup(user: User) {
    const categories = await this.categoryGroupRepository.find({
      where: {
        deletedAt: Not(IsNull()),
        categories: {
          budget: {
            user: {
              id: user.id,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        categories: {
          id: true,
          name: true,
          budget: {
            id: true,
            name: true,
          },
        },
      },
      relations: ['categories'],
      withDeleted: true,
    });

    return categories;
  }

  async removeCategoryGroup(id: string, user: User) {
    const categoryGroupExist = await this.categoryGroupRepository.findOne({
      where: {
        id,
        categories: {
          budget: {
            user: {
              id: user.id,
            },
          },
        },
      },
      relations: ['categories'],
    });

    if (!categoryGroupExist) {
      throw ApiException.notFound('Category group does not exist');
    }

    await this.categoryGroupRepository.softDelete(id);
    await this.categoryRepository.softDelete(
      categoryGroupExist.categories.map((c) => c.id),
    );
  }

  async restoreCategoryGroup(id: string, user: User) {
    const categoryGroupExist = await this.categoryGroupRepository.findOne({
      where: {
        id,
        categories: {
          budget: {
            user: {
              id: user.id,
            },
          },
        },
      },
      relations: ['categories'],
      withDeleted: true,
    });

    if (!categoryGroupExist) {
      throw ApiException.notFound('Category group does not exist');
    }

    await this.categoryGroupRepository.restore(id);
    await this.categoryRepository.restore(
      categoryGroupExist.categories.map((c) => c.id),
    );
  }
}
