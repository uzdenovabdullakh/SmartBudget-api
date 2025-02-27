import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslationService } from './translation.service';
import { CategorySpending } from 'src/entities/category-spending.entity';
import { User } from 'src/entities/user.entity';
import { calculatePeriod } from 'src/utils/helpers';
import {
  CategoryLimitDto,
  UpdateCategoryLimitDto,
} from 'src/validation/category-limit.schema';
import { Repository } from 'typeorm';
import { Category } from 'src/entities/category.entity';
import { ApiException } from 'src/exceptions/api.exception';

@Injectable()
export class CategorySpendingService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CategorySpending)
    private readonly categorySpendingRepository: Repository<CategorySpending>,
    private readonly t: TranslationService,
  ) {}

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

  async getCategoryLimitById(id: string) {
    const categoryLimit = await this.categorySpendingRepository.findOne({
      where: {
        id,
      },
    });

    if (!categoryLimit) {
      throw ApiException.notFound(
        this.t.tException('not_found', 'category_limit'),
      );
    }
    return categoryLimit;
  }

  async setCategoryLimit(id: string, dto: CategoryLimitDto, user: User) {
    const { limitAmount, limitResetPeriod } = dto;
    const [periodStart, periodEnd] = calculatePeriod(limitResetPeriod);

    const category = await this.getCategory(id, user);

    const categorySpending = this.categorySpendingRepository.create({
      category,
      limitAmount,
      limitResetPeriod,
      periodStart,
      periodEnd,
    });
    await this.categorySpendingRepository.save(categorySpending);
  }

  async getCategoryLimit(id: string, user: User) {
    await this.getCategory(id, user);

    const categoryLimit = await this.categorySpendingRepository.findOne({
      where: {
        category: { id },
      },
      select: [
        'id',
        'limitAmount',
        'spentAmount',
        'limitResetPeriod',
        'periodEnd',
        'periodStart',
      ],
    });

    return categoryLimit;
  }

  async updateCategoryLimit(id: string, dto: UpdateCategoryLimitDto) {
    await this.getCategoryLimitById(id);

    await this.categorySpendingRepository.update(id, dto);
  }

  async deleteCategoryLimit(id: string) {
    await this.getCategoryLimitById(id);

    await this.categorySpendingRepository.delete(id);
  }
}
