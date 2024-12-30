import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessages } from 'src/constants/constants';
import { Account } from 'src/entities/account.entity';
import { UnlinkedAccount } from 'src/entities/unlinked-account.entity';
import { User } from 'src/entities/user.entity';
import { ApiException } from 'src/exceptions/api.exception';
import { CreateUnlinkedAccountDto } from 'src/validation/account.schema';
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

  async getUserAccounts(budgetId: string, user: User) {
    return await this.accountRepository
      .createQueryBuilder('account')
      .innerJoin('account.budget', 'budget')
      .leftJoinAndSelect('account.unlinkedAccount', 'unlinkedAccount')
      .leftJoinAndSelect('account.bank', 'bank')
      .where('budget.id = :budgetId', { budgetId })
      .andWhere('budget.user.id = :userId', { userId: user.id })
      .select(['account.id', 'unlinkedAccount.name', 'bank.name'])
      .getMany();
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
