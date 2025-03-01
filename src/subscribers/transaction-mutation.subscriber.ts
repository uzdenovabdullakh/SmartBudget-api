import {
  EntityManager,
  EntitySubscriberInterface,
  Equal,
  EventSubscriber,
  InsertEvent,
  Or,
  RemoveEvent,
} from 'typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { Account } from 'src/entities/account.entity';
import { Category } from 'src/entities/category.entity';
import { TransactionType } from 'src/constants/enums';
import { CategorySpending } from 'src/entities/category-spending.entity';

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
      const categorySpendingRepository =
        manager.getRepository(CategorySpending);

      const account = await accountRepository.findOne({
        where: { id: transaction.account.id },
        relations: ['budget'],
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

      if (!transaction.category) {
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

        const defaultUpdateAmount =
          type === TransactionType.INCOME
            ? account.amount + amount
            : account.amount - amount;

        await categoryRepository.update(
          { id: defaultCategory.id },
          {
            available: defaultUpdateAmount,
          },
        );
      }

      if (transaction.category) {
        const categoryEntity = await categoryRepository.findOne({
          where: { id: transaction.category.id },
          relations: ['categorySpending'],
        });

        await categoryRepository.update(
          { id: categoryEntity.id },
          {
            available:
              type === TransactionType.INCOME
                ? categoryEntity.available + amount
                : categoryEntity.available - amount,
            spent:
              type === TransactionType.EXPENSE && categoryEntity.spent + amount,
          },
        );

        if (
          categoryEntity.categorySpending &&
          type === TransactionType.EXPENSE
        ) {
          const { categorySpending } = categoryEntity;
          await categorySpendingRepository.update(categorySpending.id, {
            spentAmount: categorySpending.spentAmount + amount,
          });
        }
      }
    });
  }
}
