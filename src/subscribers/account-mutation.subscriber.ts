import {
  EntityManager,
  EntitySubscriberInterface,
  Equal,
  EventSubscriber,
  InsertEvent,
  Or,
  RemoveEvent,
} from 'typeorm';
import { Account } from 'src/entities/account.entity';
import { Category } from 'src/entities/category.entity';

@EventSubscriber()
export class AccountSubscriber implements EntitySubscriberInterface<Account> {
  listenTo() {
    return Account;
  }

  async afterInsert(event: InsertEvent<Account>) {
    const { entity, manager } = event;
    await this.updateAccountAndCategory(entity, manager);
  }

  async afterSoftRemove(event: RemoveEvent<Account>) {
    const { entity, manager } = event;
    await this.updateAccountAndCategory(entity, manager, true);
  }

  private async updateAccountAndCategory(
    account: Account,
    manager: EntityManager,
    isRemoved: boolean = false,
  ) {
    await manager.connection.transaction(async (manager) => {
      const categoryRepository = manager.getRepository(Category);

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

      const amount = isRemoved ? -account.amount : account.amount;

      await categoryRepository.update(
        { id: defaultCategory.id },
        {
          available: defaultCategory.available + amount,
        },
      );
    });
  }
}
