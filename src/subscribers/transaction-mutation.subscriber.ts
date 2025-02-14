import {
  EntityManager,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { Account } from 'src/entities/account.entity';
import { Category } from 'src/entities/category.entity';
import { TransactionType } from 'src/constants/enums';

@EventSubscriber()
export class TransactionSubscriber
  implements EntitySubscriberInterface<Transaction>
{
  listenTo() {
    return Transaction;
  }

  async afterInsert(event: InsertEvent<Transaction>) {
    const { entity, manager } = event;
    await this.updateAccountAndCategory(entity, manager);
  }

  async afterRemove(event: RemoveEvent<Transaction>) {
    const { entity, manager } = event;
    await this.updateAccountAndCategory(entity, manager, true);
  }

  private async updateAccountAndCategory(
    transaction: Transaction,
    manager: EntityManager,
    isRemoved: boolean = false,
  ) {
    await manager.connection.transaction(async (manager) => {
      const accountRepository = manager.getRepository(Account);
      const categoryRepository = manager.getRepository(Category);

      const account = await accountRepository.findOne({
        where: { id: transaction.account.id },
      });

      const type = transaction.inflow
        ? TransactionType.INCOME
        : TransactionType.EXPENSE;

      const amount = isRemoved
        ? -(transaction.inflow || transaction.outflow || 0) // Если транзакция удаляется, инвертируем значение
        : transaction.inflow || transaction.outflow || 0; // Иначе используем текущее значение

      await accountRepository.update(
        { id: account.id },
        {
          amount:
            type === TransactionType.INCOME
              ? account.amount + amount
              : account.amount - amount,
        },
      );

      if (transaction.category) {
        const categoryEntity = await categoryRepository.findOne({
          where: { id: transaction.category.id },
        });

        await categoryRepository.update(
          { id: categoryEntity.id },
          {
            available:
              type === TransactionType.INCOME
                ? categoryEntity.available + amount
                : categoryEntity.available - amount,
            activity:
              type === TransactionType.INCOME
                ? categoryEntity.activity + amount
                : categoryEntity.activity - amount,
          },
        );
      }
    });
  }
}
