export type TransactionWithCategory = {
  id: string;
  inflow: number;
  outflow: number;
  description: string;
  date: Date;
  category: {
    id: string;
    name: string;
  };
};
