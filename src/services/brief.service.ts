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
    @InjectRepository(CategoryGroup)
    private readonly categoryGroupRepository: Repository<CategoryGroup>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async processUserAnswers(dto: AnswerToBriefDto, user: User) {
    const brief = this.briefRepository.create({
      briefAnswers: dto,
      isCompleted: true,
    });
    await this.briefRepository.update(
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
          ? await this.categoryGroupRepository.findOne({
              where: { name: filteredGroup },
            })
          : null;

        if (!categoryGroup && filteredGroup) {
          categoryGroup = this.categoryGroupRepository.create({
            name: filteredGroup,
          });
          await this.categoryGroupRepository.save(categoryGroup);
        }

        for (const answer of filteredAnswers) {
          let category = await this.categoryRepository.findOne({
            where: { name: answer, group: { id: categoryGroup.id } },
            relations: ['group'],
          });

          if (!category) {
            category = this.categoryRepository.create({
              name: answer,
              group: categoryGroup,
              budget: user.budgets[0],
            });
            await this.categoryRepository.save(category);
          }
        }
      }
    }
  }
}
