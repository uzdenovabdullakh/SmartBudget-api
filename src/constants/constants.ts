export const tokenLifeTime = {
  reset_password: '1h',
  activate_account: '1d',
  refresh_token: '1d',
};

export const BriefQuestions: Record<string, string | string[]> = {
  'Tell us about your home': '',
  'Do you currently have any debt?': [],
  'How do you get around?': [],
  'Which of these do you regularly spend money on?': [],
  'Which of these subscriptions do you have?': [],
  'What are some expenses that always sneak up on you?': [],
  'Are you saving, or planning to, for any of these?': [],
  'What else do you want to include - without stress or guilt?': [],
} as const;

export const QuestionCategoryMapping = {
  'Tell us about your home': {
    group: 'Home',
    categories: ['I rent', 'I own', 'Other'],
  },
  'Do you currently have any debt?': {
    group: 'Debt',
    categories: [
      'Credit Card',
      'Student Loans',
      'Auto Loans',
      'Personal Loans',
      'Medical Debt',
      "I don't currently have debt",
    ],
  },
  'How do you get around?': {
    group: 'Transport',
    categories: [
      'Car',
      'Bike',
      'Public transit',
      'Walk',
      'Rideshare (Uber/Lyft/etc.)',
      'Wheelchair',
      'Motorcycle',
      'None of these apply to me',
    ],
  },
  'Which of these do you regularly spend money on?': {
    group: 'Regular',
    categories: [
      'Groceries',
      'Phone',
      'Internet',
      'Personal Care',
      'Clothing',
      'None of these apply to me',
    ],
  },
  'Which of these subscriptions do you have?': {
    group: 'Subscriptions',
    categories: [
      'Music',
      'Audio or ebooks',
      'TV streaming',
      'News',
      'Fitness',
      'Meal delivery',
      'Online courses',
      "I don't subscribe to any of these",
    ],
  },
  'What are some expenses that always sneak up on you?': {
    group: 'Unexpected',
    categories: [
      'Annual credit card fees',
      'Medical expenses',
      'Taxes or other fees',
      'None of these apply to me',
    ],
  },
  'Are you saving, or planning to, for any of these?': {
    group: 'Savings',
    categories: [
      'Emergency fund',
      'New car',
      'Retirement',
      'Vacation',
      'Investments',
      'Baby',
      'New home',
      'Wedding',
      "I don't save for any of these",
    ],
  },
  'What else do you want to include - without stress or guilt?': {
    group: 'Other',
    categories: [
      'Dining out',
      'Charity',
      'Entertainment',
      'Gifts',
      'Video games',
      'Home decor',
      'Hobbies',
      'Celebrations',
    ],
  },
};

export const ErrorMessages = {
  INVALID_TOKEN: 'Invalid or expired token',
  USER_NOT_FOUND: 'User does not exists',
  BUDGET_ALREADY_EXISTS: 'Budget already exists',
  USER_ALREADY_EXISTS: 'User already exists',
  USER_IS_NOT_ACTIVATED: 'User is not activated. Resend activation email',
  INVALID_DURATION: 'Invalid duration format',
  INVALID_CREADENTIALS: 'Invalid credentials',
  INVALID_TOKEN_TYPE: 'Invalid token type',
  MAIL_NOT_SEND: 'Mail does not send',
  GOAL_NOT_FOUND: 'Goal does not exists',
  CATEGORY_NOT_FOUND: 'Category does not exists',
  CATEGORY_ALREADY_EXISTS: 'Category already exist',
  BUDGET_NOT_FOUND: 'Budget does not exists',
  CATEGORY_GROUP_NOT_FOUND: 'Category group does not exists',
  CATEGORY_GROUP_ALREADY_EXISTS: 'Category group already exists',
  ACCOUNT_NOT_FOUND: 'Account does not exists',
  ACCOUNT_ALREADY_EXISTS: 'Account already exists',
  PASSWORD_DID_NOT_MATCH: 'Current password is incorrect',
  TOO_MANY_REQUESTS:
    'Too many requests for this action. Please check your email',
  USER_IS_DELETED: 'User is deleted. Please restore your account',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
};

export const ErrorCodes = {
  USER_DELETED: 'USER_DELETED',
  USER_NOT_ACTIVATED: 'USER_NOT_ACTIVATED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
};
