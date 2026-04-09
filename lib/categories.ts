/** Main transaction / budget categories (must match TransactionModal). */
export const BUDGET_CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Others",
] as const;

export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];
