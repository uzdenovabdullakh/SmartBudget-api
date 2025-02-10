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
    const userBudget = await this.budgetRepository.findOne({
      where: {
        user: { id: user.id },
        accounts: {
          id: dto.accountId,
        },
      },
    });
    if (!userBudget) {
      throw ApiException.notFound(this.t.tException('not_found', 'budget'));
    }

    const transaction = this.transactionRepository.create(dto);
    await this.transactionRepository.save(transaction);
  }

  async importTransactions(id: string, file: Express.Multer.File) {
    const account = await this.accountRepository.findOneBy({
      id,
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
      amount: t.amount,
      category: t.category?.name || null,
      type: t.type,
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

  async getTransactions(filter: GetTransactionsQuery) {
    const query = this.transactionRepository.createQueryBuilder('transaction');

    if (filter.startDate)
      query.andWhere('transaction.date >= :startDate', {
        startDate: filter.startDate,
      });
    if (filter.endDate)
      query.andWhere('transaction.date <= :endDate', {
        endDate: filter.endDate,
      });
    if (filter.category)
      query.andWhere('transaction.category = :category', {
        category: filter.category,
      });
    if (filter.type)
      query.andWhere('transaction.type = :type', { type: filter.type });

    return await query.getMany();
  }

  async getTransactionById(id: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });
    if (!transaction) {
      throw ApiException.notFound(
        this.t.tException('not_found', 'transaction'),
      );
    }

    return transaction;
  }

  async updateTransaction(id: string, dto: UpdateTransactionDto) {
    await this.getTransactionById(id);

    await this.transactionRepository.update(id, dto);
  }

  async deleteTransactions(ids: string[]) {
    await this.transactionRepository.manager.connection.transaction(
      async (manager) => {
        const transactionRepository = manager.getRepository(Transaction);
        const transactions = await transactionRepository.find({
          where: {
            id: In(ids),
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
