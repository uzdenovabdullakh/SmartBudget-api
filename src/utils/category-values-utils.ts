interface CategoryEntity {
  available: number;
  spent: number;
  assigned: number;
}

const adjustValue = (
  current: number,
  amount: number,
): { adjusted: number; remaining: number } => {
  const decrease = Math.min(current, amount);
  return {
    adjusted: current - decrease,
    remaining: amount - decrease,
  };
};

export const handleRemoveIncome = (
  category: CategoryEntity,
  amount: number,
): void => {
  let remainingAmount = amount;

  if (category.available > 0) {
    const { remaining } = adjustValue(category.available, amount);
    category.available -= remainingAmount;
    remainingAmount = remaining;
  } else {
    category.available -= remainingAmount;
  }

  if (remainingAmount > 0) {
    category.spent = Math.max(0, category.spent + remainingAmount);
  }
};

export const handleRemoveExpense = (
  category: CategoryEntity,
  amount: number,
): void => {
  if (category.spent > 0) {
    const { adjusted } = adjustValue(category.spent, amount);
    category.spent = adjusted;
  }

  category.available += amount;
  category.spent = Math.max(0, category.spent - amount);
};

export const handleInsertIncome = (
  category: CategoryEntity,
  amount: number,
): void => {
  if (category.spent > 0) {
    const { adjusted } = adjustValue(category.spent, amount);
    category.spent = adjusted;
  }
  category.available += amount;
};

export const handleInsertExpense = (
  category: CategoryEntity,
  amount: number,
): void => {
  let remainingAmount = amount;

  if (category.assigned > 0) {
    const { adjusted, remaining } = adjustValue(category.assigned, amount);
    category.assigned = adjusted;
    remainingAmount = remaining;
  }

  const overspending =
    category.available >= 0
      ? Math.max(0, remainingAmount - category.available)
      : remainingAmount;
  category.spent += overspending;
  category.available -= remainingAmount;
};
