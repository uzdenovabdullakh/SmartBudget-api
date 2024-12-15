import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionCategoryMapping } from 'src/constants/constants';
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
      user,
      briefAnswers: dto,
      isCompleted: true,
    });
    await this.briefRepository.save(brief);

    for (const [question, userAnswer] of Object.entries(dto)) {
      const mapping = QuestionCategoryMapping[question];

      if (mapping) {
        let categoryGroup = await this.categoryGroupRepository.findOne({
          where: { name: mapping.group },
        });

        if (!categoryGroup) {
          categoryGroup = this.categoryGroupRepository.create({
            name: mapping.group,
          });
          await this.categoryGroupRepository.save(categoryGroup);
        }

        const answers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

        for (const answer of answers) {
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
