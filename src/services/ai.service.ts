import { HfInference } from '@huggingface/inference';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Analytic } from 'src/entities/analytic.entity';
import {
  AutoCategorizeDto,
  ProvideFinancialAdviceDto,
} from 'src/validation/ai.schema';
import { In, IsNull, Repository } from 'typeorm';
import { TranslationService } from './translation.service';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionType } from 'src/constants/enums';
import { I18nContext } from 'nestjs-i18n';
import {
  CategorizedTransaction,
  UncategorizedTransaction,
} from 'src/types/transactions.type';
import { nanoid } from 'nanoid';
import { User } from 'src/entities/user.entity';
import { CategoryGroupsService } from './category-groups.service';
import { CategoriesService } from './categories.service';
import { ApiException } from 'src/exceptions/api.exception';
import { TransactionsService } from './transactions.service';

@Injectable()
export class AIService {
  private hfInference: HfInference;

  constructor(
    private readonly configService: ConfigService,
    private readonly t: TranslationService,
    @InjectRepository(Analytic)
    private readonly analyticsRepository: Repository<Analytic>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly categoryGroupsService: CategoryGroupsService,
    private readonly categoryService: CategoriesService,
    private readonly transactionService: TransactionsService,
  ) {
    this.hfInference = new HfInference(
      this.configService.get<string>('HF_TOKEN'),
    );
  }

  async provideFinancialAdvice(dto: ProvideFinancialAdviceDto) {
    const { message, budgetId } = dto;

    const predefinedQuestions = {
      [this.t.tPrompts(
        'Forecast my monthly expenses based on spending history',
      )]: {
        data: await this.fetchUserTransactions(
          budgetId,
          TransactionType.EXPENSE,
        ),
      },
      [this.t.tPrompts('Provide recommendations to optimize my budget')]: {
        data: await this.fetchUserTransactions(budgetId, 'all'),
      },
      [this.t.tPrompts('Give me advice to reduce unnecessary expenses')]: {
        data: await this.fetchUserTransactions(
          budgetId,
          TransactionType.EXPENSE,
        ),
      },
      [this.t.tPrompts('Help me allocate my income more effectively')]: {
        data: await this.fetchUserTransactions(
          budgetId,
          TransactionType.INCOME,
        ),
      },
    };

    const advisorResponse = await this.generateAdvisorResponse(
      message,
      predefinedQuestions[message].data,
      budgetId,
    );

    return advisorResponse;
  }

  async getConversationHistory(
    budgetId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const latestAnalytic = await this.analyticsRepository.findOne({
      where: { budget: { id: budgetId } },
      order: { createdAt: 'DESC' },
    });

    if (!latestAnalytic) {
      return [];
    }

    const conversationHistory = latestAnalytic.conversationHistory;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHistory = conversationHistory.slice(startIndex, endIndex);

    return paginatedHistory;
  }

  async categorize(dto: string[], user: User) {
    await this.transactionRepository.manager.transaction(async (manager) => {
      const transactionRepository = manager.getRepository(Transaction);

      const transactions = await transactionRepository.find({
        where: {
          id: In(dto),
          category: IsNull(),
        },
        relations: ['account', 'account.budget'],
      });

      if (!transactions.length) return;
      const budgetId = transactions[0].account.budget.id;
      const account = transactions[0].account;

      const defaultCategory = await this.categoryService.getDefaultCategory(
        budgetId,
        user,
      );

      const transactionsWithDescription = transactions.filter(
        (trx) => trx.description,
      );
      const transactionsWithoutDescription = transactions.filter(
        (trx) => !trx.description,
      );

      if (transactionsWithoutDescription.length) {
        await transactionRepository.update(
          { id: In(transactionsWithoutDescription.map((trx) => trx.id)) },
          { category: { id: defaultCategory.id } },
        );
        return;
      }

      if (!transactionsWithDescription.length) return;

      const categoryGroups =
        await this.categoryGroupsService.getGroupsWithCategories(
          budgetId,
          { default: false },
          user,
        );

      const transactionData = transactionsWithDescription.map(
        ({ id, description, inflow, outflow }) => ({
          id,
          description,
          inflow: inflow ? inflow : null,
          outflow: outflow ? outflow : null,
        }),
      );
      const categories = categoryGroups
        .flatMap((group) => group.categories)
        .map(({ id, name }) => ({ id, name }));

      const categorizeResponse = await this.categorizeResponse(
        transactionData,
        categories,
      );

      const newCategories = categorizeResponse
        .filter((trx) => !trx.categoryId)
        .map((trx) => ({
          name: trx.categoryName,
          account,
          user,
          groupName: trx.categoryGroupName,
        }));

      const createdCategories = await this.categoryService.bulkFindOrCreate(
        newCategories,
        manager,
      );
      const categoryMap = new Map(
        createdCategories.map((cat) => [cat.name, cat.id]),
      );

      for (const trx of categorizeResponse) {
        const categoryId = trx.categoryId ?? categoryMap.get(trx.categoryName);
        await this.transactionService.updateTransaction(
          trx.id,
          {
            category: categoryId,
          },
          user,
        );
      }
    });
  }

  async autoCategorize(dto: AutoCategorizeDto, user: User) {
    await this.transactionRepository.manager.transaction(async (manager) => {
      const transactionRepository = manager.getRepository(Transaction);

      const transactions = await transactionRepository.find({
        where: {
          account: { id: dto.accountId },
          category: IsNull(),
        },
        relations: ['account', 'account.budget'],
      });

      if (!transactions.length) return;
      const budgetId = transactions[0].account.budget.id;
      const account = transactions[0].account;

      const defaultCategory = await this.categoryService.getDefaultCategory(
        budgetId,
        user,
      );

      const transactionsWithDescription = transactions.filter(
        (trx) => trx.description,
      );
      const transactionsWithoutDescription = transactions.filter(
        (trx) => !trx.description,
      );

      if (transactionsWithoutDescription.length) {
        await transactionRepository.update(
          { id: In(transactionsWithoutDescription.map((trx) => trx.id)) },
          { category: { id: defaultCategory.id } },
        );
        return;
      }

      if (!transactionsWithDescription.length) return;

      const categoryGroups =
        await this.categoryGroupsService.getGroupsWithCategories(
          budgetId,
          { default: false },
          user,
        );

      const transactionData = transactionsWithDescription.map(
        ({ id, description, inflow, outflow }) => ({
          id,
          description,
          inflow: inflow ? inflow : null,
          outflow: outflow ? outflow : null,
        }),
      );
      const categories = categoryGroups
        .flatMap((group) => group.categories)
        .map(({ id, name }) => ({ id, name }));

      const categorizeResponse = await this.categorizeResponse(
        transactionData,
        categories,
      );

      const newCategories = categorizeResponse
        .filter((trx) => !trx.categoryId)
        .map((trx) => ({
          name: trx.categoryName,
          account,
          user,
          groupName: trx.categoryGroupName,
        }));

      const createdCategories = await this.categoryService.bulkFindOrCreate(
        newCategories,
        manager,
      );
      const categoryMap = new Map(
        createdCategories.map((cat) => [cat.name, cat.id]),
      );

      for (const trx of categorizeResponse) {
        const categoryId = trx.categoryId ?? categoryMap.get(trx.categoryName);
        await this.transactionService.updateTransaction(
          trx.id,
          {
            category: categoryId,
          },
          user,
        );
      }
    });
  }

  private async categorizeResponse(
    transactionData: UncategorizedTransaction[],
    categories: {
      id: string;
      name: string;
    }[],
  ) {
    const lang = I18nContext.current().lang;

    const systemPrompt = `You will be given an array of existing categories and transactions. You must categorize transactions using the description of the transaction. If the transaction does not belong to one of the presented categories, you need to create a new category and group for the category. A group is the entity to which a category belongs. For example, the Pharmacy category and the Dentistry category will belong to the medical expenses group on a common basis (both Pharmacy and Dentistry belong to medicine).
    Do not write any solutions or explanations, complete the task yourself and give the answer in the form of a json array, SCTRICTLY as in the example:
    [
      {
        id: string, // id of transaction
        сategoryId: string, //id of presented category
        categoryName: string, // name of the new category, if the transaction does not belong to one of the presented categories
        categoryGroupName: string, //a group name for a new category, if the transaction does not belong to one of the presented categories
      },
    ]
    Categories ${JSON.stringify(categories)}.
    Transactions ${JSON.stringify(transactionData)}.
    Use the language for categoryName or categoryGroupName: ${lang}.
    `;

    const modelResponse = await this.hfInference.chatCompletion({
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.2,
      n: 1,
      provider: 'sambanova',
    });

    const advisorMessage = modelResponse.choices[0].message.content;

    let categorizeResponse: {
      id: string;
      categoryId: string;
      categoryName: string;
      categoryGroupName: string;
    }[];
    try {
      categorizeResponse = JSON.parse(advisorMessage);
    } catch (error) {
      throw ApiException.serverError(`AI вернул некорректный JSON: ${error}`);
    }
    return categorizeResponse;
  }

  private async generateAdvisorResponse(
    userMessage: string,
    transactionData: CategorizedTransaction[],
    budgetId: string,
  ) {
    const lang = I18nContext.current().lang;

    const conversationHistory = await this.getConversationHistory(budgetId);

    conversationHistory.push({
      id: nanoid(),
      role: 'user',
      content: userMessage,
    });

    const systemPrompt = `You're a financial advisor. Use language: ${lang}. Write a comprehensive and concise answer, no more than 300 words. You don't need to write down what formulas or algorithms you use for analysis, just recommendations and an analysis that is understandable to an ordinary person. You need to analyze following data in order to respond to the user: ${JSON.stringify(
      transactionData,
    )} `;

    const modelResponse = await this.hfInference.chatCompletion({
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...conversationHistory,
      ],
      max_tokens: 1100,
      temperature: 0.3,
      n: 1,
      provider: 'sambanova',
    });

    const advisorMessage = modelResponse.choices[0].message.content;

    const newConversation = {
      id: nanoid(),
      role: 'assistant',
      content: advisorMessage,
    };

    conversationHistory.push(newConversation);

    await this.saveConversation(conversationHistory, budgetId);

    return newConversation;
  }

  private async saveConversation(
    conversationHistory: {
      id: string;
      role: string;
      content: string;
    }[],
    budgetId: string,
  ) {
    let analytic = await this.analyticsRepository.findOne({
      where: { budget: { id: budgetId } },
    });

    if (analytic) {
      analytic.conversationHistory = conversationHistory;
    } else {
      analytic = this.analyticsRepository.create({
        budget: { id: budgetId },
        conversationHistory,
      });
    }

    await this.analyticsRepository.save(analytic);
  }

  private async fetchUserTransactions(
    budgetId: string,
    transactionType: TransactionType | 'all',
  ) {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .select([
        'transaction.id',
        'transaction.outflow',
        'transaction.inflow',
        'transaction.date',
        'transaction.description',
      ])
      .addSelect(['category.id', 'category.name'])
      .innerJoin('transaction.account', 'account')
      .innerJoin('account.budget', 'budget')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('budget.id = :budgetId', { budgetId });

    if (transactionType === TransactionType.EXPENSE) {
      query.andWhere('transaction.outflow > 0');
    }
    if (transactionType === TransactionType.INCOME) {
      query.andWhere('transaction.inflow > 0');
    }
    if (transactionType === 'all') {
      query.andWhere('transaction.inflow > 0 OR transaction.outflow > 0');
    }

    const transactions: CategorizedTransaction[] = await query.getMany();
    return transactions;
  }
}
