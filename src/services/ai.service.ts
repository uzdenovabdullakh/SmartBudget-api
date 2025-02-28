import { HfInference } from '@huggingface/inference';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Analytic } from 'src/entities/analytic.entity';
import { ProvideFinancialAdviceDto } from 'src/validation/ai.schema';
import { Repository } from 'typeorm';
import { TranslationService } from './translation.service';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionType } from 'src/constants/enums';
import { I18nContext } from 'nestjs-i18n';
import { TransactionWithCategory } from 'src/types/transactions.type';
import { nanoid } from 'nanoid';

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

  private async generateAdvisorResponse(
    userMessage: string,
    transactionData: TransactionWithCategory[],
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

    const transactions: TransactionWithCategory[] = await query.getMany();
    return transactions;
  }
}
