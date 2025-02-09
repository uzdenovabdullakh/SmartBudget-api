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
import { CreateAccountDto } from 'src/validation/account.schema';
import { PaginationQueryDto } from 'src/validation/pagination.schema';
import { In, IsNull, Not, Repository } from 'typeorm';

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
          `a.name AS name`,
          'a.type AS type',
          `CASE
            WHEN b.settings ->> 'currencyPlacement' = 'before' THEN
              CONCAT(b.settings ->> 'currency', a.amount)
            ELSE
              CONCAT(a.amount, b.settings ->> 'currency') END
            AS amount`,
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
        .select(
          `CASE
            WHEN b.settings ->> 'currencyPlacement' = 'before' THEN
              CONCAT(b.settings ->> 'currency', SUM(a.amount))
            ELSE
            CONCAT(SUM(a.amount), b.settings ->> 'currency') END`,
          'totalBalance',
        )
        .groupBy('b.settings');

      return sumQueryBuilder.getRawOne<{ totalBalance: string }>();
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
      .select([
        'a.id AS id',
        `a.name AS name`,
        'a.type AS type',
        `CASE
          WHEN b.settings ->> 'currencyPlacement' = 'before' THEN
            CONCAT(b.settings ->> 'currency', a.amount)
          ELSE
            CONCAT(a.amount, b.settings ->> 'currency') END
          AS amount`,
        'a.created_at AS "createdAt"',
      ])
      .getRawOne<AccountDetails>();

    if (!account) {
      throw ApiException.notFound(this.t.tException('not_found', 'account'));
    }
    return account;
  }

  async getRemovedAccounts(user: User) {
    return await this.accountRepository
      .createQueryBuilder('account')
      .withDeleted()
      .innerJoin('account.budget', 'budget')
      .where('budget.user.id = :userId', { userId: user.id })
      .andWhere('account.deletedAt IS NOT NULL')
      .select(['account.id', 'account.name'])
      .getMany();
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

    await this.accountRepository.softRemove(account);
  }

  async deleteForever(ids: string[], user: User) {
    await this.accountRepository.manager.transaction(async (manager) => {
      const accountRepository = manager.getRepository(Account);

      const accounts = await accountRepository.find({
        where: {
          id: In(ids),
          deletedAt: Not(IsNull()),
          budget: {
            user: {
              id: user.id,
            },
          },
        },
        withDeleted: true,
        relations: ['budget', 'budget.user'],
      });

      const foundIds = accounts.map((account) => account.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));
      if (notFoundIds.length > 0) {
        throw ApiException.notFound(this.t.tException('not_found', 'account'));
      }

      await accountRepository.remove(accounts);
    });
  }

  async restoreAccounts(ids: string[], user: User) {
    await this.accountRepository.manager.transaction(async (manager) => {
      const accountRepository = manager.getRepository(Account);

      const accounts = await accountRepository.find({
        where: {
          id: In(ids),
          deletedAt: Not(IsNull()),
          budget: {
            user: {
              id: user.id,
            },
          },
        },
        withDeleted: true,
        relations: ['budget', 'budget.user'],
      });

      const foundIds = accounts.map((account) => account.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));
      if (notFoundIds.length > 0) {
        throw ApiException.notFound(this.t.tException('not_found', 'account'));
      }

      await accountRepository.recover(accounts);
    });
  }
}
