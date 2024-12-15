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
