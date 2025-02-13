import { BriefQuizType } from 'src/types/brief.types';

export const tokenLifeTime = {
  reset_password: '1h',
  activate_account: '1d',
  refresh_token: '1d',
};

export const BriefQuiz: BriefQuizType = {
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
      'Rideshare or taxi',
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
      'None of these apply to me',
    ],
  },
};

export const categoryMapping = {
  'Tell us about your home': {
    group: 'housing',
    categories: {
      'I rent': 'rent',
      'I own': 'mortgage',
      Internet: 'internet',
      Phone: 'phone',
    },
  },
  'Do you currently have any debt?': {
    group: 'debt',
    categories: {
      'Credit Card': 'credit_card',
      'Student Loans': 'student_loans',
      'Auto Loans': 'auto_loans',
      'Personal Loans': 'personal_loans',
      'Medical Debt': 'medical_debt',
    },
  },
  'How do you get around?': {
    group: 'transportation',
    categories: {
      Car: 'car',
      Motorcycle: 'motorcycle',
      'Public transit': 'public_transit',
      'Rideshare or taxi': 'rideshare',
      Bike: 'bike',
    },
    exclude: ['Walk', 'Wheelchair', 'None of these apply to me'],
  },
  'Which of these do you regularly spend money on?': {
    group: 'basic_expenses',
    categories: {
      Groceries: 'groceries',
      'Personal Care': 'personal_care',
      Clothing: 'clothing',
    },
  },
  'Which of these subscriptions do you have?': {
    group: 'subscriptions',
    categories: {
      Music: 'music',
      'Audio or ebooks': 'audio_ebooks',
      'TV streaming': 'tv_streaming',
      News: 'news',
      Fitness: 'fitness',
      'Meal delivery': 'meal_delivery',
      'Online courses': 'online_courses',
    },
    exclude: ["I don't subscribe to any of these"],
  },
  'What are some expenses that always sneak up on you?': {
    group: 'unexpected_expenses',
    categories: {
      'Annual credit card fees': 'annual_fees',
      'Medical expenses': 'medical_expenses',
      'Taxes or other fees': 'taxes_fees',
    },
  },
  'Are you saving, or planning to, for any of these?': {
    group: 'savings',
    categories: {
      'Emergency fund': 'emergency_fund',
      'New car': 'new_car',
      Retirement: 'retirement',
      Vacation: 'vacation',
      Investments: 'investments',
      Baby: 'baby',
      'New home': 'new_home',
      Wedding: 'wedding',
    },
    exclude: ["I don't save for any of these"],
  },
  'What else do you want to include - without stress or guilt?': {
    group: 'personal_spending',
    categories: {
      'Dining out': 'dining_out',
      Charity: 'charity',
      Entertainment: 'entertainment',
      Gifts: 'gifts',
      'Video games': 'video_games',
      'Home decor': 'home_decor',
      Hobbies: 'hobbies',
      Celebrations: 'celebrations',
    },
    exclude: ['None of these apply to me'],
  },
};

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  USER_DELETED: 'USER_DELETED',
  USER_NOT_ACTIVATED: 'USER_NOT_ACTIVATED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
};
