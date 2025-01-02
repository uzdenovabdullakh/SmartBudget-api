import {
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Brief } from 'src/entities/brief.entity';
import { Budget } from 'src/entities/budget.entity';
import { BriefQuiz } from 'src/constants/constants';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async afterUpdate(event: UpdateEvent<User>) {
    const { databaseEntity, entity, manager } = event;

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
        name: `${entity.login} budget`,
      });
      await manager.save(Budget, budget);
    }
  }
}
