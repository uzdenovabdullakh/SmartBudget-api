import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { stringify } from 'csv-stringify/sync';
import {
  CreateTransactionDto,
  GetTransactionsQuery,
  UpdateTransactionDto,
} from 'src/validation/transaction.schema';
import { Transaction } from 'src/entities/transaction.entity';
import { User } from 'src/entities/user.entity';
import { Budget } from 'src/entities/budget.entity';
import { ApiException } from 'src/exceptions/api.exception';
import { TranslationService } from './translation.service';
import { Account } from 'src/entities/account.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly t: TranslationService,
  ) {}

  async createTransaction(dto: CreateTransactionDto, user: User) {
    const { accountId, category } = dto;
    const userBudget = await this.budgetRepository.findOne({
      where: {
        user: { id: user.id },
        accounts: {
          id: accountId,
        },
      },
    });
    if (!userBudget) {
      throw ApiException.notFound(this.t.tException('not_found', 'budget'));
    }

    const transaction = this.transactionRepository.create({
      account: {
        id: accountId,
      },
      ...dto,
      category: category ? { id: category } : undefined,
    });
    await this.transactionRepository.save(transaction);
  }

  async importTransactions(id: string, file: Express.Multer.File, user: User) {
    const account = await this.accountRepository.findOne({
      where: {
        id,
        budget: {
          user: {
            id: user.id,
          },
        },
      },
    });
    if (!account) {
      throw ApiException.notFound(this.t.tException('not_found', 'account'));
    }

    const extension = file.originalname.split('.').pop();
    let data: Transaction[];

    if (extension === 'csv') {
      data = parse(file.buffer.toString(), {
        columns: true,
        skip_empty_lines: true,
      });
    } else if (extension === 'xlsx') {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(sheet);
    }

    const transactions = data.map((row) =>
      this.transactionRepository.create({
        ...row,
        account,
      }),
    );
    await this.transactionRepository.save(transactions);
  }

  async exportTransactions(type: 'csv' | 'xlsx') {
    const transactions = await this.transactionRepository.find();
    const data = transactions.map((t: Transaction) => ({
      id: t.id,
      inflow: t.inflow,
      outflow: t.outflow,
      category: t.category?.name || null,
      description: t.description,
      date: t.date.toISOString(),
    }));

    if (type == 'csv') {
      return Buffer.from(stringify(data, { header: true }));
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const xlsxBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });
    return Buffer.from(xlsxBuffer);
  }

  async getTransactions(id: string, filter: GetTransactionsQuery, user: User) {
    const {
      startDate,
      endDate,
      inflow,
      outflow,
      category,
      order = 'ASC',
      page = 1,
      pageSize = 10,
      search = '',
    } = filter;

    const offset = (page - 1) * pageSize;

    const baseQueryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.account', 'account')
      .innerJoin('account.budget', 'budget')
      .where('budget.user.id = :userId', { userId: user.id })
      .andWhere('account.id = :accountId', { accountId: id });

    if (startDate)
      baseQueryBuilder.andWhere('transaction.date >= :startDate', {
        startDate: filter.startDate,
      });
    if (endDate)
      baseQueryBuilder.andWhere('transaction.date <= :endDate', {
        endDate: filter.endDate,
      });
    if (category)
      baseQueryBuilder.andWhere('transaction.category = :category', {
        category: filter.category,
      });
    if (inflow) baseQueryBuilder.addOrderBy('transaction.inflow', order);
    if (outflow) baseQueryBuilder.addOrderBy('transaction.outflow', order);
    if (search)
      baseQueryBuilder.andWhere(
        '(LOWER(transaction.description) LIKE :search)',
        {
          search: `%${search}%`,
        },
      );

    const transactionsQueryBuilder = baseQueryBuilder
      .clone()
      .select([
        'transaction.id',
        'transaction.amount',
        'transaction.outflow',
        'transaction.inflow',
        'transaction.date',
        'transaction.description',
      ])
      .orderBy('transaction.date', order)
      .offset(offset)
      .limit(pageSize);
    const transactions = await transactionsQueryBuilder.getMany();

    const countQueryBuilder = baseQueryBuilder
      .clone()
      .select('COUNT(*)', 'totalCount');
    const totalCount = await countQueryBuilder.getRawOne<{
      totalCount: number;
    }>();

    return {
      transactions,
      totalPages: Math.ceil((totalCount?.totalCount || 0) / pageSize),
    };
  }

  async getTransactionById(id: string, user: User) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id,
        account: {
          budget: {
            user: {
              id: user.id,
            },
          },
        },
      },
      select: ['id'],
    });

    if (!transaction) {
      throw ApiException.notFound(
        this.t.tException('not_found', 'transaction'),
      );
    }

    return transaction;
  }

  async updateTransaction(id: string, dto: UpdateTransactionDto, user: User) {
    await this.getTransactionById(id, user);

    await this.transactionRepository.update(id, {
      ...dto,
      category: dto.category ? { id: dto.category } : undefined,
    });
  }

  async deleteTransactions(ids: string[], user: User) {
    await this.transactionRepository.manager.connection.transaction(
      async (manager) => {
        const transactionRepository = manager.getRepository(Transaction);
        const transactions = await transactionRepository.find({
          where: {
            id: In(ids),
            account: {
              budget: {
                user: {
                  id: user.id,
                },
              },
            },
          },
        });

        const foundIds = transactions.map((budget) => budget.id);
        const notFoundIds = ids.filter((id) => !foundIds.includes(id));
        if (notFoundIds.length > 0) {
          throw ApiException.notFound(
            this.t.tException('not_found', 'transaction'),
          );
        }

        await transactionRepository.delete(ids);
      },
    );
  }
}
