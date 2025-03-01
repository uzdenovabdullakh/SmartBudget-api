export type CategorizedTransaction = {
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

export type UncategorizedTransaction = {
  id: string;
  inflow: number;
  outflow: number;
  description: string;
};
