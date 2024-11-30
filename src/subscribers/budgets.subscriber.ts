import { Budget } from 'src/entities/budget.entity';
import { BudgetsCategories } from 'src/entities/budgets-categories.entity';
import { Category } from 'src/entities/category.entity';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
} from 'typeorm';

@EventSubscriber()
export class BudgetSubscriber implements EntitySubscriberInterface<Budget> {
  listenTo() {
    return Budget;
  }

  async afterInsert(event: InsertEvent<Budget>) {
    const { manager } = event;
    const budgetId = event.entity.id;
    const userId = event.entity.user.id;

    const existingBudgets = await manager.find(Budget, {
      where: { user: { id: userId } },
    });

    if (existingBudgets.length > 1) {
      return;
    }

    const defaultCategories = await manager.find(Category);

    if (defaultCategories.length === 0) {
      await manager.insert(Category, [
        {
          type: 'Rent',
        },
        {
          type: 'Utilities',
        },
        {
          type: 'Internet',
        },
        {
          type: 'Groceries',
        },
        {
          type: 'Emergency fund',
        },
        {
          type: 'Medical expenses',
        },
        {
          type: 'Train/Bus fare',
        },
      ]);
    }

    const categories = defaultCategories.length
      ? defaultCategories
      : await manager.find(Category);

    const budgetCategories = categories.map((category) => ({
      category: { id: category.id },
      budget: { id: budgetId },
    }));

    await manager.insert(BudgetsCategories, budgetCategories);
  }
}
