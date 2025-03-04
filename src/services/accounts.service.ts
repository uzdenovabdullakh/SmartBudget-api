import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslationService } from './translation.service';
import { Account } from 'src/entities/account.entity';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import {
  AccountDetails,
  AccountsSummaryResponse,
} from 'src/types/account.type';
import {
  CreateAccountDto,
  UpdateAccountDto,
} from 'src/validation/account.schema';
import { PaginationQueryDto } from 'src/validation/pagination.schema';
import { Equal, Not, Or, Repository } from 'typeorm';
import { Category } from 'src/entities/category.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly t: TranslationService,
  ) {}

  async createAccount(data: CreateAccountDto, user: User) {
    await this.accountRepository.manager.transaction(async (manager) => {
      const accountRepository = manager.getRepository(Account);

      const accountExist = await accountRepository.findOne({
        where: {
          name: data.name,
          budget: {
            user: {
              id: user.id,
            },
          },
        },
        withDeleted: true,
      });

      if (accountExist) {
        throw ApiException.badRequest(
          this.t.tException('already_exists', 'account'),
        );
      }

      const newAccount = accountRepository.create({
        budget: {
          id: data.budgetId,
        },
        ...data,
      });

      await accountRepository.save(newAccount);
    });
  }

  async getUserAccounts({
    budgetId,
    user,
    query,
  }: {
    budgetId: string;
    user: User;
    query: PaginationQueryDto;
  }): Promise<AccountsSummaryResponse> {
    const { order = 'ASC', page = 1, pageSize = 10, search = '' } = query;

    const offset = (page - 1) * pageSize;

    const baseQueryBuilder = this.accountRepository
      .createQueryBuilder('a')
      .innerJoin('a.budget', 'b')
      .where('a.budget_id = :budgetId', { budgetId })
      .andWhere('b.user_id = :userId', { userId: user.id });

    const getAccounts = async () => {
      const accountsQueryBuilder = baseQueryBuilder
        .clone()
        .select([
          'a.id AS id',
          'a.name AS name',
          'a.type AS type',
          'a.amount::REAL AS amount',
          'a.created_at AS "createdAt"',
        ])
        .orderBy('a.created_at', order)
        .offset(offset)
        .limit(pageSize);

      if (search) {
        accountsQueryBuilder.andWhere('(LOWER(a.name) LIKE :search)', {
          search: `%${search}%`,
        });
      }

      return accountsQueryBuilder.getRawMany<AccountDetails>();
    };

    const getTotalBalance = async () => {
      const sumQueryBuilder = baseQueryBuilder
        .clone()
        .select('SUM(a.amount)::REAL', 'totalBalance')
        .groupBy('b.settings');

      return sumQueryBuilder.getRawOne<{ totalBalance: number }>();
    };

    const getTotalCount = async () => {
      const countQueryBuilder = baseQueryBuilder
        .clone()
        .select('COUNT(*)', 'totalCount');

      if (search) {
        countQueryBuilder.andWhere('(LOWER(a.name) LIKE :search)', {
          search: `%${search.toLowerCase()}%`,
        });
      }

      return countQueryBuilder.getRawOne<{ totalCount: number }>();
    };

    const [accounts, totalBalanceResult, totalCountResult] = await Promise.all([
      getAccounts(),
      getTotalBalance(),
      getTotalCount(),
    ]);

    return {
      accounts,
      totalBalance: totalBalanceResult?.totalBalance,
      totalPages: Math.ceil((totalCountResult?.totalCount || 0) / pageSize),
    };
  }

  async getUserAccount(id: string, user: User) {
    const account = await this.accountRepository
      .createQueryBuilder('a')
      .innerJoin('a.budget', 'b')
      .where('a.id = :id', { id: id })
      .andWhere('b.user.id = :userId', { userId: user.id })
      .select(['a.id', 'a.name', 'a.type', 'a.amount', 'b'])
      .getOne();

    if (!account) {
      throw ApiException.notFound(this.t.tException('not_found', 'account'));
    }
    return account;
  }

  async deleteAccount(id: string, user: User) {
    const account = await this.accountRepository.findOne({
      where: {
        id,
        budget: {
          user: {
            id: user.id,
          },
        },
      },
      relations: ['budget', 'budget.user'],
    });

    if (!account) {
      throw ApiException.notFound(this.t.tException('not_found', 'account'));
    }

    await this.accountRepository.remove(account);
  }

  async updateAccount(id: string, dto: UpdateAccountDto, user: User) {
    await this.accountRepository.manager.connection.transaction(
      async (manager) => {
        const currentAccount = await this.getUserAccount(id, user);

        const categoryRepository = manager.getRepository(Category);
        const accountRepository = manager.getRepository(Account);

        if (dto.name) {
          const accountExist = await this.accountRepository.findOne({
            where: {
              id: Not(id),
              name: Equal(dto.name),
              budget: {
                user: {
                  id: user.id,
                },
              },
            },
            withDeleted: true,
          });
          if (accountExist) {
            throw ApiException.conflictError(
              this.t.tException('already_exists', 'account'),
            );
          }
        }

        await accountRepository.update(
          {
            id,
          },
          dto,
        );
        if (dto.amount) {
          const amountImpact = dto.amount - currentAccount.amount;

          await this.updateDefaultCategory(
            currentAccount,
            categoryRepository,
            amountImpact,
          );
        }
      },
    );
  }

  private async updateDefaultCategory(
    account: Account,
    categoryRepository: Repository<Category>,
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
