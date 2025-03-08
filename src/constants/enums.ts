export enum TokensType {
  RESET_PASSWORD = 'reset_password',
  ACTIVATE_ACCOUNT = 'activate_account',
  REFRESH_TOKEN = 'refresh_token',
  RESTORE_ACCOUNT = 'restore_account',
}

export enum AccountType {
  CASH = 'cash',
  CARD = 'card',
  SAVINGS = 'savings',
  BANK = 'bank',
}

export enum Period {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  NONE = 'none',
}

export enum ReminderEntityType {
  GOAL = 'goal',
  DEBT = 'debt',
  CATEGORY_LIMIT = 'category_limit',
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum CategoryFilter {
  SPENT = 'spent',
  AVAILABLE = 'available',
  LIMIT_REACHED = 'limit_reached',
  ASSIGNED = 'assigned',
}

export enum GetGoalFilter {
  ACTIVE = 'active',
  REACHED = 'reached',
}
