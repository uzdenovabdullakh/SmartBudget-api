export enum TokensType {
  RESET_PASSWORD = 'reset_password',
  ACTIVATE_ACCOUNT = 'activate_account',
  REFRESH_TOKEN = 'refresh_token',
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum GoalsPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
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

export enum CategoryLimitResetPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  NONE = 'none',
}

export enum ReminderEntityType {
  GOAL = 'goal',
  DEBT = 'debt',
  CATEGORY_LIMIT = 'category_limit',
}
