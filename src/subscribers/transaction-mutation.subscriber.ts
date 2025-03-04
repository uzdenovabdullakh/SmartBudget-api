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
import {
  handleInsertExpense,
  handleInsertIncome,
  handleRemoveExpense,
  handleRemoveIncome,
} from 'src/utils/category-values-utils';

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

  private async updateCategory(
    transaction: Transaction,
    manager: EntityManager,
    isRemoved: boolean = false,
  ) {
    if (!transaction.category) {
      return;
    }

    const categoryRepository = manager.getRepository(Category);
    const categorySpendingRepository = manager.getRepository(CategorySpending);

    const categoryEntity = await categoryRepository.findOne({
      where: { id: transaction.category.id },
      relations: ['categorySpending'],
    });

    if (!categoryEntity) {
      return;
    }

    const type = transaction.inflow
      ? TransactionType.INCOME
      : TransactionType.EXPENSE;
    const amount = transaction.inflow || transaction.outflow || 0;

    if (isRemoved) {
      if (type === TransactionType.INCOME) {
        handleRemoveIncome(categoryEntity, amount);
      } else {
        handleRemoveExpense(categoryEntity, amount);
      }
    } else {
      if (type === TransactionType.INCOME) {
        handleInsertIncome(categoryEntity, amount);
      } else {
        handleInsertExpense(categoryEntity, amount);
      }
    }

    await categoryRepository.save(categoryEntity);

    if (categoryEntity.categorySpending && type === TransactionType.EXPENSE) {
      const { categorySpending } = categoryEntity;
      const spentAmount = isRemoved ? -amount : amount;
      await categorySpendingRepository.update(categorySpending.id, {
        spentAmount: Math.max(0, categorySpending.spentAmount + spentAmount),
      });
    }
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

        await categoryRepository.update(
          { id: defaultCategory.id },
          {
            available:
              type === TransactionType.INCOME
                ? account.amount + amount
                : account.amount - amount,
          },
        );
      }

      if (transaction.category) {
        await this.updateCategory(transaction, manager, isRemoved);
      }
    });
  }
}
