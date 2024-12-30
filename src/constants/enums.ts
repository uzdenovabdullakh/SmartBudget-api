export enum TokensType {
  RESET_PASSWORD = 'reset_password',
  ACTIVATE_ACCOUNT = 'activate_account',
  REFRESH_TOKEN = 'refresh_token',
  RESTORE_ACCOUNT = 'restore_account',
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum UnlinkedAccountType {
  CASH = 'cash',
  CARD = 'card',
  SAVINGS = 'savings',
}

export enum AnalyticsPredictionType {
  EXPENSES = 'expenses',
  INCOME = 'income',
  CATEGORY_DISTRIBUTION = 'category_distribution',
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
