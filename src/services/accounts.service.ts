import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessages } from 'src/constants/constants';
import { Account } from 'src/entities/account.entity';
import { UnlinkedAccount } from 'src/entities/unlinked-account.entity';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import {
  AccountDetails,
  AccountsSummaryResponse,
} from 'src/types/account.type';
import { CreateUnlinkedAccountDto } from 'src/validation/account.schema';
import { PaginationQueryDto } from 'src/validation/pagination.schema';
import { In, IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(UnlinkedAccount)
    private readonly unlinkedAccountRepository: Repository<UnlinkedAccount>,
  ) {}

  async createUnlinkedAccount(data: CreateUnlinkedAccountDto, user: User) {
    const accountExist = await this.unlinkedAccountRepository.findOne({
      where: {
        name: data.name,
        account: {
          budget: {
            user: {
              id: user.id,
            },
          },
        },
      },
      withDeleted: true,
    });
    if (accountExist) {
      throw ApiException.conflictError(ErrorMessages.ACCOUNT_ALREADY_EXISTS);
    }

    const unlinkedAccount = this.unlinkedAccountRepository.create(data);
    const newUnlinkedAccount =
      await this.unlinkedAccountRepository.save(unlinkedAccount);

    const newAccount = this.accountRepository.create({
      budget: {
        id: data.budgetId,
      },
      unlinkedAccount: newUnlinkedAccount,
    });
    const account = await this.accountRepository.save(newAccount);

    return await this.getUserAccount(account.id, user);
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
      .leftJoin('a.unlinkedAccount', 'ua')
      .leftJoin('a.bank', 'ba')
      .innerJoin('a.budget', 'b')
      .where('a.budget_id = :budgetId', { budgetId })
      .andWhere('b.user_id = :userId', { userId: user.id });

    const getAccounts = async () => {
      const accountsQueryBuilder = baseQueryBuilder
        .clone()
        .select([
          'a.id AS id',
          `COALESCE(ua.name, ba.name, 'Unknown') AS name`,
          'a.type AS type',
          `CASE
            WHEN b.settings ->> 'currencyPlacement' = 'before' THEN
              CONCAT(b.settings ->> 'currency', COALESCE(ua.amount, ba.amount, 0))
            ELSE
              CONCAT(COALESCE(ua.amount, ba.amount, 0), b.settings ->> 'currency') END
            AS amount`,
          'a.created_at AS "createdAt"',
        ])
        .orderBy('a.created_at', order)
        .skip(offset)
        .take(pageSize);

      if (search) {
        accountsQueryBuilder.andWhere(
          '(LOWER(ua.name) LIKE :search OR LOWER(ba.name) LIKE :search)',
          { search: `%${search}%` },
        );
      }

      return accountsQueryBuilder.getRawMany<AccountDetails>();
    };

    const getTotalBalance = async () => {
      const sumQueryBuilder = baseQueryBuilder
        .clone()
        .select(
          `CASE
            WHEN b.settings ->> 'currencyPlacement' = 'before' THEN
              CONCAT(b.settings ->> 'currency', (COALESCE(SUM(ua.amount), 0) + COALESCE(SUM(ba.amount), 0)))
            ELSE
            CONCAT((COALESCE(SUM(ua.amount), 0) + COALESCE(SUM(ba.amount), 0)), b.settings ->> 'currency') END`,
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
        countQueryBuilder.andWhere(
          '(LOWER(ua.name) LIKE :search OR LOWER(ba.name) LIKE :search)',
          { search: `%${search.toLowerCase()}%` },
        );
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
      .createQueryBuilder('account')
      .innerJoin('account.budget', 'budget')
      .leftJoinAndSelect('account.unlinkedAccount', 'unlinkedAccount')
      .leftJoinAndSelect('account.bank', 'bank')
      .where('account.id = :id', { id: id })
      .andWhere('budget.user.id = :userId', { userId: user.id })
      .select([
        'account.id',
        'unlinkedAccount.name',
        'unlinkedAccount.type',
        'unlinkedAccount.amount',
        'bank.name',
      ])
      .getOne();

    if (!account) {
      throw ApiException.notFound(ErrorMessages.ACCOUNT_NOT_FOUND);
    }
    return account;
  }

  async getRemovedAccounts(user: User) {
    return await this.accountRepository
      .createQueryBuilder('account')
      .withDeleted()
      .innerJoin('account.budget', 'budget')
      .leftJoinAndSelect('account.unlinkedAccount', 'unlinkedAccount')
      .leftJoinAndSelect('account.bank', 'bank')
      .where('budget.user.id = :userId', { userId: user.id })
      .andWhere('account.deletedAt IS NOT NULL')
      .select(['account.id', 'unlinkedAccount.name', 'bank.name'])
      .getMany();
  }

  async deleteAccount(id: string, user: User) {
    await this.getUserAccount(id, user);

    await this.accountRepository.softDelete(id);
  }

  async deleteForever(ids: string[], user: User) {
    const accounts = await this.accountRepository.find({
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
      throw ApiException.notFound(ErrorMessages.ACCOUNT_NOT_FOUND);
    }

    await this.accountRepository.delete(ids);
  }

  async restoreAccounts(ids: string[], user: User) {
    const accounts = await this.accountRepository.find({
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
      throw ApiException.notFound(ErrorMessages.ACCOUNT_NOT_FOUND);
    }

    await this.accountRepository.restore(ids);
  }
}
