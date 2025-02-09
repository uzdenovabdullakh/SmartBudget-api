export type AccountDetails = {
  id: string;
  name: string;
  amount: string;
  type: string;
  createdAt: Date;
};

export type AccountsSummaryResponse = {
  accounts: AccountDetails[];
  totalBalance: string;
  totalPages: number;
};
