import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, In, Or, Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
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
  calculateAmountImpact,
  hasCategoryChanged,
  parseCSVToTransactions,
  parseXLSXToTransactions,
} from 'src/utils/helpers';
import { CategorySpending } from 'src/entities/category-spending.entity';
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
      relations: [
        'account',
        'category',
        'account.budget',
        'category.categorySpending',
      ],
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

    await this.updateRelations(
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

  private async updateRelations(
    currentTransaction: Transaction,
    newTransaction: Transaction,
  ) {
    await this.transactionRepository.manager.connection.transaction(
      async (manager) => {
        const accountRepository = manager.getRepository(Account);
        const categoryRepository = manager.getRepository(Category);
        const categorySpendingRepository =
          manager.getRepository(CategorySpending);

        const currentType = currentTransaction.inflow
          ? TransactionType.INCOME
          : TransactionType.EXPENSE;
        const currentAmount =
          currentTransaction.inflow || currentTransaction.outflow || 0;

        const newType = newTransaction.inflow
          ? TransactionType.INCOME
          : TransactionType.EXPENSE;
        const newAmount = newTransaction.inflow || newTransaction.outflow || 0;

        const amountImpact = calculateAmountImpact({
          currentAmount,
          currentType,
          newAmount,
          newType,
        });

        await this.updateAccount(
          accountRepository,
          currentTransaction.account,
          amountImpact,
        );

        const categoryChanged = hasCategoryChanged(
          currentTransaction,
          newTransaction,
        );

        if (categoryChanged) {
          let oldCategory = currentTransaction.category;
          const newCategory = newTransaction.category;

          // Handle uncategorized transaction
          if (!oldCategory) {
            oldCategory = await categoryRepository.findOne({
              where: {
                name: Or(
                  Equal('Inflow: Ready to Assign'),
                  Equal('Приток: Готов к перераспределению'),
                ),
                group: {
                  budget: { id: currentTransaction.account.budget.id },
                },
              },
            });
          }

          await this.updateCategoryForCategoryChange({
            categoryRepository,
            oldCategory,
            newCategory,
            amount: newAmount,
            type: newType,
            categorySpendingRepository,
          });
        } else if (newTransaction.category) {
          const category = newTransaction.category;

          if (currentType !== newType) {
            // Handle type switch
            await this.updateCategoryForTypeSwitch({
              categoryRepository,
              category,
              oldType: currentType,
              newType: newType,
              oldAmount: currentAmount,
              newAmount: newAmount,
              categorySpendingRepository,
            });
          } else {
            // Handle amount change within same type
            const amountImpact = newAmount - currentAmount;
            if (newType === TransactionType.INCOME) {
              await this.updateCategoryForInflowChange({
                categoryRepository,
                category,
                amountImpact,
              });
            } else {
              await this.updateCategoryForOutflowChange({
                categoryRepository,
                category,
                amountImpact,
                categorySpendingRepository,
              });
            }
          }
        } else {
          // Update default category if no category is assigned
          await this.updateDefaultCategory(
            categoryRepository,
            currentTransaction.account,
            newAmount - currentAmount,
          );
        }
      },
    );
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

  private async updateCategoryForInflowChange({
    categoryRepository,
    category,
    amountImpact,
  }: {
    categoryRepository: Repository<Category>;
    category: Category;
    amountImpact: number;
  }) {
    if (!category) return;

    if (amountImpact > 0) {
      // Increase inflow: reduce spent, increase available
      const spentReduction = Math.min(amountImpact, category.spent);
      const newSpent = category.spent - spentReduction;
      const newAvailable = category.available + amountImpact;

      await categoryRepository.update(
        { id: category.id },
        {
          available: newAvailable,
          spent: newSpent,
        },
      );
    } else {
      // Decrease inflow: reduce available, increase spent if available goes negative
      const decreaseAmount = Math.abs(amountImpact);
      const newAvailable = category.available - decreaseAmount;
      const newSpent =
        newAvailable < 0
          ? category.spent + Math.abs(newAvailable)
          : category.spent;

      await categoryRepository.update(
        { id: category.id },
        {
          available: newAvailable,
          spent: newSpent,
        },
      );
    }
  }

  private async updateCategoryForOutflowChange({
    categoryRepository,
    category,
    amountImpact,
    categorySpendingRepository,
  }: {
    categoryRepository: Repository<Category>;
    category: Category;
    amountImpact: number;
    categorySpendingRepository: Repository<CategorySpending>;
  }) {
    if (!category) return;

    if (amountImpact > 0) {
      // Increase outflow: reduce assigned, then available, increase spent if negative
      const assignedReduction = Math.min(amountImpact, category.assigned);
      const remainingImpact = amountImpact - assignedReduction;
      const newAssigned = category.assigned - assignedReduction;
      const newAvailable = category.available - remainingImpact;
      const newSpent = newAvailable < 0 ? Math.abs(newAvailable) : 0;

      await categoryRepository.update(
        { id: category.id },
        {
          assigned: Math.max(newAssigned, 0),
          available: newAvailable,
          spent: newSpent,
        },
      );

      if (category.categorySpending) {
        await categorySpendingRepository.update(category.categorySpending.id, {
          spentAmount: category.categorySpending.spentAmount + amountImpact,
        });
      }
    } else {
      // Decrease outflow: increase available, reduce spent
      const decreaseAmount = Math.abs(amountImpact);
      const newAvailable = category.available + decreaseAmount;
      const spentReduction = Math.min(decreaseAmount, category.spent);
      const newSpent = category.spent - spentReduction;

      await categoryRepository.update(
        { id: category.id },
        {
          available: newAvailable,
          spent: newSpent,
        },
      );

      if (category.categorySpending) {
        await categorySpendingRepository.update(category.categorySpending.id, {
          spentAmount: Math.max(
            category.categorySpending.spentAmount - decreaseAmount,
            0,
          ),
        });
      }
    }
  }

  private async updateCategoryForTypeSwitch({
    categoryRepository,
    category,
    oldType,
    newType,
    oldAmount,
    newAmount,
    categorySpendingRepository,
  }: {
    categoryRepository: Repository<Category>;
    category: Category;
    oldType: TransactionType;
    newType: TransactionType;
    oldAmount: number;
    newAmount: number;
    categorySpendingRepository: Repository<CategorySpending>;
  }) {
    if (!category) return;

    // Remove old type effect
    if (oldType === TransactionType.INCOME) {
      await this.updateCategoryForInflowChange({
        categoryRepository,
        category,
        amountImpact: -oldAmount,
      });
    } else {
      await this.updateCategoryForOutflowChange({
        categoryRepository,
        category,
        amountImpact: -oldAmount,
        categorySpendingRepository,
      });
    }

    // Apply new type effect
    const totalAmount = oldAmount + newAmount;
    if (newType === TransactionType.INCOME) {
      await this.updateCategoryForInflowChange({
        categoryRepository,
        category,
        amountImpact: totalAmount,
      });
    } else {
      await this.updateCategoryForOutflowChange({
        categoryRepository,
        category,
        amountImpact: totalAmount,
        categorySpendingRepository,
      });
    }
  }

  private async updateCategoryForCategoryChange({
    categoryRepository,
    oldCategory,
    newCategory,
    amount,
    type,
    categorySpendingRepository,
  }: {
    categoryRepository: Repository<Category>;
    oldCategory: Category | null;
    newCategory: Category;
    amount: number;
    type: TransactionType;
    categorySpendingRepository: Repository<CategorySpending>;
  }) {
    if (!oldCategory && !newCategory) return;

    if (type === TransactionType.INCOME) {
      // Для inflow-транзакций
      if (oldCategory) {
        await this.updateCategoryForOutflowChange({
          categoryRepository,
          category: oldCategory,
          amountImpact: amount,
          categorySpendingRepository,
        });
      }
      await this.updateCategoryForInflowChange({
        categoryRepository,
        category: newCategory,
        amountImpact: amount,
      });
    } else {
      // Для outflow-транзакций
      if (oldCategory) {
        await this.updateCategoryForInflowChange({
          categoryRepository,
          category: oldCategory,
          amountImpact: amount,
        });
      }
      await this.updateCategoryForOutflowChange({
        categoryRepository,
        category: newCategory,
        amountImpact: amount,
        categorySpendingRepository,
      });
    }
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

    await categoryRepository.update(
      { id: defaultCategory.id },
      {
        available: defaultCategory.available + amountImpact,
      },
    );
  }
}
