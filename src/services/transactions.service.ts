import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, In, Or, Repository } from 'typeorm';
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
import { Category } from 'src/entities/category.entity';
import { TransactionType } from 'src/constants/enums';
import {
  parseCSVToTransactions,
  parseXLSXToTransactions,
} from 'src/utils/helpers';
import { CategorizedTransaction } from 'src/types/transactions.type';
import { CategoriesService } from './categories.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly categoryService: CategoriesService,
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
    await this.transactionRepository.manager.connection.transaction(
      async (manager) => {
        const transactionRepository = manager.getRepository(Transaction);
        const accountRepository = manager.getRepository(Account);

        const account = await accountRepository.findOne({
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
        if (!account) {
          throw ApiException.notFound(
            this.t.tException('not_found', 'account'),
          );
        }

        const extension = file.originalname.split('.').pop();
        let parsedTrx: any[];

        if (extension === 'csv') {
          const rawData = parse(file.buffer.toString(), {
            skip_empty_lines: true,
            quote: "'",
            delimiter: ',',
            relax_quotes: true,
            relax_column_count: true,
          });

          parsedTrx = parseCSVToTransactions(rawData, this.t);
        } else if (extension === 'xlsx') {
          const workbook = XLSX.read(file.buffer, { type: 'buffer' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rawData: any[] = XLSX.utils.sheet_to_json(sheet);

          const trashData = rawData
            .slice(0, 10)
            .find((row) =>
              Object.keys(row).some((val) => val.includes('__EMPTY')),
            );
          if (trashData) {
            throw ApiException.conflictError(
              this.t.tException(
                'Transaction headers were not found. The xlsx or csv format may be incorrect, or the values may be garbage',
              ),
            );
          }

          parsedTrx = parseXLSXToTransactions(rawData);
        }

        const categoriesToFind = parsedTrx.map((parsed) => ({
          name: parsed.category,
          user,
          account,
        }));

        const categories = await this.categoryService.bulkFindOrCreate(
          categoriesToFind,
          manager,
        );
        const categoryMap = new Map(categories.map((c) => [c.name, c]));

        const transactions: object[] = parsedTrx.map((parsed) => ({
          ...parsed,
          category: { id: categoryMap.get(parsed.category)?.id },
        }));

        const newTransactions = transactions.map((row) =>
          transactionRepository.create({
            ...row,
            account,
          }),
        );
        await transactionRepository.save(newTransactions, { chunk: 100 });
      },
    );
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
      orderBy,
      order = 'DESC',
      page = 1,
      pageSize = 10,
      search = '',
    } = filter;

    const offset = (page - 1) * pageSize;

    const baseQueryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.account', 'account')
      .innerJoin('account.budget', 'budget')
      .leftJoinAndSelect('transaction.category', 'category')
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
    if (orderBy) {
      baseQueryBuilder.addOrderBy(orderBy, order).addGroupBy(orderBy);
    }
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
        'transaction.outflow',
        'transaction.inflow',
        'transaction.date',
        'transaction.description',
      ])
      .addSelect(['category.id', 'category.name'])
      .orderBy('transaction.date', order)
      .groupBy('transaction.id, category.id')
      .offset(offset)
      .limit(pageSize);
    const transactions: CategorizedTransaction[] =
      await transactionsQueryBuilder.getMany();

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
      select: ['id', 'inflow', 'outflow'],
      relations: ['account', 'category', 'account.budget'],
    });

    if (!transaction) {
      throw ApiException.notFound(
        this.t.tException('not_found', 'transaction'),
      );
    }

    return transaction;
  }

  async updateTransaction(id: string, dto: UpdateTransactionDto, user: User) {
    const currentTransaction = await this.getTransactionById(id, user);

    await this.transactionRepository.update(id, {
      ...dto,
      category: dto.category ? { id: dto.category } : undefined,
    });

    await this.updateAccountAndCategory(
      currentTransaction,
      await this.getTransactionById(id, user),
    );
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
          relations: ['account', 'category'],
        });

        const foundIds = transactions.map((tx) => tx.id);
        const notFoundIds = ids.filter((id) => !foundIds.includes(id));
        if (notFoundIds.length > 0) {
          throw ApiException.notFound(
            this.t.tException('not_found', 'transaction'),
          );
        }

        await transactionRepository.remove(transactions);
      },
    );
  }

  private async updateAccountAndCategory(
    currentTransaction: Transaction,
    newTransaction: Transaction,
  ) {
    await this.transactionRepository.manager.connection.transaction(
      async (manager) => {
        const accountRepository = manager.getRepository(Account);
        const categoryRepository = manager.getRepository(Category);

        const currentType = currentTransaction.inflow
          ? TransactionType.INCOME
          : TransactionType.EXPENSE;
        const currentAmount =
          currentTransaction.inflow || currentTransaction.outflow || 0;

        const newType = newTransaction.inflow
          ? TransactionType.INCOME
          : TransactionType.EXPENSE;
        const newAmount = newTransaction.inflow || newTransaction.outflow || 0;

        const amountImpact = this.calculateAmountImpact(
          currentAmount,
          currentType,
          newAmount,
          newType,
        );

        await this.updateAccount(
          accountRepository,
          currentTransaction.account,
          amountImpact,
        );

        if (!newTransaction.category) {
          await this.updateDefaultCategory(
            categoryRepository,
            currentTransaction.account,
            amountImpact,
          );
        }

        if (this.hasCategoryChanged(currentTransaction, newTransaction)) {
          await this.updateCategory(
            categoryRepository,
            currentTransaction.category,
            -amountImpact,
          );
          await this.updateCategory(
            categoryRepository,
            newTransaction.category,
            amountImpact,
          );
        } else if (newTransaction.category) {
          await this.updateCategory(
            categoryRepository,
            newTransaction.category,
            amountImpact,
          );
        }
      },
    );
  }

  private calculateAmountImpact(
    currentAmount: number,
    currentType: TransactionType,
    newAmount: number,
    newType: TransactionType,
  ): number {
    let amountImpact = newAmount - currentAmount;
    if (newType !== currentType) {
      amountImpact =
        (currentType === TransactionType.INCOME
          ? -currentAmount
          : currentAmount) +
        (newType === TransactionType.INCOME ? newAmount : -newAmount);
    }
    return amountImpact;
  }

  private async updateAccount(
    accountRepository: Repository<Account>,
    account: Account,
    amountImpact: number,
  ) {
    await accountRepository.update(
      { id: account.id },
      { amount: account.amount + amountImpact },
    );
  }

  private hasCategoryChanged(
    currentTransaction: Transaction,
    newTransaction: Transaction,
  ): boolean {
    return currentTransaction.category?.id !== newTransaction.category?.id;
  }

  private async updateCategory(
    categoryRepository: Repository<Category>,
    category: Category,
    amountImpact: number,
  ) {
    if (!category) return;
    await categoryRepository.update(
      { id: category.id },
      {
        available: category.available + amountImpact,
        activity: category.activity + amountImpact,
      },
    );
  }

  private async updateDefaultCategory(
    categoryRepository: Repository<Category>,
    account: Account,
    amountImpact: number,
  ) {
    const defaultCategory = await categoryRepository.findOne({
      where: {
        name: Or(
          Equal('Inflow: Ready to Assign'),
          Equal('Приток: Готов к перераспределению'),
        ),
        group: {
          budget: {
            id: account.budget.id,
          },
        },
      },
    });

    await this.updateCategory(
      categoryRepository,
      defaultCategory,
      amountImpact,
    );
  }
}
