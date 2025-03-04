import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Brief } from 'src/entities/brief.entity';
import { Budget } from 'src/entities/budget.entity';
import { BriefQuiz } from 'src/constants/constants';
import { Account } from 'src/entities/account.entity';
import { AccountType } from 'src/constants/enums';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async afterUpdate(event: UpdateEvent<User>) {
    const { databaseEntity, entity, manager } = event;

    if (!databaseEntity) {
      return;
    }

    if (databaseEntity.isActivated === false && entity.isActivated === true) {
      const brief = manager.create(Brief, {
        user: entity,
        briefAnswers: Object.fromEntries(
          Object.entries(BriefQuiz).map(([question]) => [question, []]),
        ),
      });
      await manager.save(Brief, brief);

      const budget = manager.create(Budget, {
        user: entity,
        name: `Бюджет ${entity.login}`,
      });
      await manager.save(Budget, budget);

      await manager.save(Account, {
        name: 'Первый счет',
        budget: budget,
        type: AccountType.CASH,
        amount: 0,
      });
    }
  }

  async afterInsert(event: InsertEvent<User>) {
    const { entity, manager } = event;

    if (entity.isActivated) {
      const brief = manager.create(Brief, {
        user: entity,
        briefAnswers: Object.fromEntries(
          Object.entries(BriefQuiz).map(([question]) => [question, []]),
        ),
      });
      await manager.save(Brief, brief);

      const budget = manager.create(Budget, {
        user: entity,
        name: `Бюджет ${entity.login}`,
      });
      await manager.save(Budget, budget);

      await manager.save(Account, {
        name: 'Первый счет',
        budget: budget,
        type: AccountType.CASH,
        amount: 0,
      });
    }
  }
}
