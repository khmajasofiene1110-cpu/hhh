export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  username: string;
  amount: number;
  type: TransactionType;
  category: string;
  subCategory: string | null;
  provider: string | null;
  timestamp: string;
};
