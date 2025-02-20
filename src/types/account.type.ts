export type AccountDetails = {
  id: string;
  name: string;
  amount: number;
  type: string;
  createdAt: Date;
};

export type AccountsSummaryResponse = {
  accounts: AccountDetails[];
  totalBalance: number;
  totalPages: number;
};
