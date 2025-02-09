import { Account } from 'src/entities/account.entity';
import { Bank } from 'src/entities/bank.entity';
import { UnlinkedAccount } from 'src/entities/unlinked-account.entity';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
  SoftRemoveEvent,
  RecoverEvent,
} from 'typeorm';

@EventSubscriber()
export class AccountSubscriber implements EntitySubscriberInterface<Account> {
  listenTo() {
    return Account;
  }

  async afterRemove(event: RemoveEvent<Account>) {
    const { entity, manager } = event;

    if (entity?.bank) {
      await manager.remove(Bank, entity.bank);
    }

    if (entity?.unlinkedAccount) {
      await manager.remove(UnlinkedAccount, entity.unlinkedAccount);
    }
  }

  async afterSoftRemove(event: SoftRemoveEvent<Account>) {
    const { databaseEntity, manager } = event;

    if (databaseEntity?.bank) {
      const bankEntity = manager.create(Bank, databaseEntity.bank);
      await manager.softRemove(bankEntity);
    }

    if (databaseEntity?.unlinkedAccount) {
      const unlinkedAccountEntity = manager.create(
        UnlinkedAccount,
        databaseEntity.unlinkedAccount,
      );
      await manager.softRemove(unlinkedAccountEntity);
    }
  }

  async afterRecover(event: RecoverEvent<Account>) {
    const { entity, manager } = event;

    if (entity?.bank) {
      await manager.recover(Bank, entity.bank);
    }

    if (entity?.unlinkedAccount) {
      await manager.recover(UnlinkedAccount, entity.unlinkedAccount);
    }
  }
}
