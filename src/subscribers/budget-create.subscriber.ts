import { Budget } from 'src/entities/budget.entity';
import { CategoryGroup } from 'src/entities/category-group.entity';
import { Category } from 'src/entities/category.entity';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

@EventSubscriber()
export class BudgetSubscriber implements EntitySubscriberInterface<Budget> {
  listenTo() {
    return Budget;
  }

  async afterInsert(event: InsertEvent<Budget>) {
    const { entity: newBudget, manager } = event;

    const firstBudget = await manager.findOne(Budget, {
      where: { user: { id: newBudget.user.id } },
      order: { createdAt: 'ASC' },
    });

    if (!firstBudget || firstBudget.id === newBudget.id) {
      return;
    }

    const categoryGroups = await manager.find(CategoryGroup, {
      where: { budget: { id: firstBudget.id } },
      relations: ['categories'],
    });

    for (const group of categoryGroups) {
      const newGroup = manager.create(CategoryGroup, {
        name: group.name,
        budget: newBudget,
        deletedAt: null,
      });

      await manager.save(newGroup);

      const newCategories = group.categories.map((category) =>
        manager.create(Category, {
          name: category.name,
          assigned: 0,
          spent: 0,
          available: 0,
          group: newGroup,
          goal: null,
        }),
      );

      await manager.save(newCategories);
    }
  }
}
