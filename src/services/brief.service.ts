import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { categoryMapping } from 'src/constants/constants';
import { Brief } from 'src/entities/brief.entity';
import { CategoryGroup } from 'src/entities/category-group.entity';
import { Category } from 'src/entities/category.entity';
import { User } from 'src/entities/user.entity';
import { AnswerToBriefDto } from 'src/validation/brief.schema';
import { Repository } from 'typeorm';
import { TranslationService } from './translation.service';

@Injectable()
export class BriefService {
  constructor(
    @InjectRepository(Brief)
    private readonly briefRepository: Repository<Brief>,
    private readonly t: TranslationService,
  ) {}

  async processUserAnswers(dto: AnswerToBriefDto, user: User) {
    await this.briefRepository.manager.transaction(async (manager) => {
      const briefRepository = manager.getRepository(Brief);
      const categoryGroupRepository = manager.getRepository(CategoryGroup);
      const categoryRepository = manager.getRepository(Category);

      const brief = await briefRepository.findOne({
        where: { user: { id: user.id } },
      });
      if (!brief) {
        const newrBief = briefRepository.create({
          user,
          briefAnswers: dto,
          isCompleted: true,
        });
        await briefRepository.save(newrBief);
      } else {
        await briefRepository.update(
          { user },
          { briefAnswers: dto, isCompleted: true },
        );
      }

      for (const [question, userAnswers] of Object.entries(dto)) {
        const mapping = categoryMapping[question];

        if (!mapping) continue;

        const validAnswers = userAnswers.filter(
          (answer) =>
            mapping.categories[answer] && !mapping.exclude?.includes(answer),
        );

        if (validAnswers.length === 0) continue;

        const translatedGroupName = this.t.tCategories(mapping.group, 'groups');

        let categoryGroup = await categoryGroupRepository.findOne({
          where: { name: translatedGroupName },
        });

        if (!categoryGroup) {
          categoryGroup = categoryGroupRepository.create({
            name: translatedGroupName,
          });
          await categoryGroupRepository.save(categoryGroup);
        }

        for (const answer of validAnswers) {
          const categoryName = mapping.categories[answer];

          const translatedCategoryName = this.t.tCategories(
            categoryName,
            'names',
          );

          let category = await categoryRepository.findOne({
            where: {
              name: translatedCategoryName,
              group: { id: categoryGroup.id },
              budget: user.budgets[0],
            },
            relations: ['group'],
          });

          if (!category) {
            category = categoryRepository.create({
              name: translatedCategoryName,
              group: categoryGroup,
              budget: user.budgets[0],
            });
            await categoryRepository.save(category);
          }
        }
      }

      await this.createDefaultCategory(
        categoryGroupRepository,
        categoryRepository,
        user,
      );
    });
  }

  private async createDefaultCategory(
    categoryGroupRepository: Repository<CategoryGroup>,
    categoryRepository: Repository<Category>,
    user: User,
  ) {
    const translatedGroupName = this.t.tCategories('Inflow', 'groups');

    let categoryGroup = await categoryGroupRepository.findOne({
      where: { name: translatedGroupName },
    });

    if (!categoryGroup) {
      categoryGroup = categoryGroupRepository.create({
        name: translatedGroupName,
      });
      await categoryGroupRepository.save(categoryGroup);
    }

    const translatedCategoryName = this.t.tCategories(
      'Inflow: Ready to Assign',
      'names',
    );

    let category = await categoryRepository.findOne({
      where: {
        name: translatedCategoryName,
        group: { id: categoryGroup.id },
        budget: user.budgets[0],
      },
      relations: ['group'],
    });

    if (!category) {
      category = categoryRepository.create({
        name: translatedCategoryName,
        group: categoryGroup,
        budget: user.budgets[0],
        assigned: 0,
      });
      await categoryRepository.save(category);
    }
  }
}
