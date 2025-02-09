import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BriefQuiz } from 'src/constants/constants';
import { Brief } from 'src/entities/brief.entity';
import { CategoryGroup } from 'src/entities/category-group.entity';
import { Category } from 'src/entities/category.entity';
import { User } from 'src/entities/user.entity';
import { AnswerToBriefDto } from 'src/validation/brief.schema';
import { Repository } from 'typeorm';

@Injectable()
export class BriefService {
  constructor(
    @InjectRepository(Brief)
    private readonly briefRepository: Repository<Brief>,
  ) {}

  async processUserAnswers(dto: AnswerToBriefDto, user: User) {
    await this.briefRepository.manager.transaction(async (manager) => {
      const briefRepository = manager.getRepository(Brief);
      const categoryGroupRepository = manager.getRepository(CategoryGroup);
      const categoryRepository = manager.getRepository(Category);

      const brief = briefRepository.create({
        briefAnswers: dto,
        isCompleted: true,
      });
      await briefRepository.update(
        {
          user,
        },
        brief,
      );

      for (const [question, userAnswer] of Object.entries(dto)) {
        const mapping = BriefQuiz[question];

        if (mapping) {
          // убираем последний элемент из ответов, если это отрицательный ответ
          const filteredAnswers = userAnswer.filter(
            (answer) =>
              answer !== mapping.categories[mapping.categories.length - 1],
          );

          const filteredGroup = filteredAnswers.length ? mapping.group : null;

          let categoryGroup = filteredGroup
            ? await categoryGroupRepository.findOne({
                where: { name: filteredGroup },
              })
            : null;

          if (!categoryGroup && filteredGroup) {
            categoryGroup = categoryGroupRepository.create({
              name: filteredGroup,
            });
            await categoryGroupRepository.save(categoryGroup);
          }

          for (const answer of filteredAnswers) {
            let category = await categoryRepository.findOne({
              where: { name: answer, group: { id: categoryGroup.id } },
              relations: ['group'],
            });

            if (!category) {
              category = categoryRepository.create({
                name: answer,
                group: categoryGroup,
                budget: user.budgets[0],
              });
              await categoryRepository.save(category);
            }
          }
        }
      }
    });
  }
}
