import { getTransactionsForUser } from "@/lib/transactions-storage";
import type { Transaction } from "@/lib/types/transaction";

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function getMonthlyIncomeAndExpenses(username: string): {
  income: number;
  expenses: number;
} {
  const txs = getTransactionsForUser(username);
  const start = startOfMonth(new Date()).getTime();
  let income = 0;
  let expenses = 0;
  for (const t of txs) {
    if (new Date(t.timestamp).getTime() < start) continue;
    if (t.type === "income") income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses };
}

export function getTotalsForUser(username: string): {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
} {
  const txs = getTransactionsForUser(username);
  let totalIncome = 0;
  let totalExpenses = 0;
  for (const t of txs) {
    if (t.type === "income") totalIncome += t.amount;
    else totalExpenses += t.amount;
  }
  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
  };
}

export function getExpenseTotalsByCategoryThisMonth(
  username: string
): Record<string, number> {
  const txs = getTransactionsForUser(username);
  const start = startOfMonth(new Date()).getTime();
  const map: Record<string, number> = {};
  for (const t of txs) {
    if (t.type !== "expense") continue;
    if (new Date(t.timestamp).getTime() < start) continue;
    map[t.category] = (map[t.category] ?? 0) + t.amount;
  }
  return map;
}

export function getExpenseTotalsByCategoryAllTime(
  username: string
): Record<string, number> {
  const txs = getTransactionsForUser(username);
  const map: Record<string, number> = {};
  for (const t of txs) {
    if (t.type !== "expense") continue;
    map[t.category] = (map[t.category] ?? 0) + t.amount;
  }
  return map;
}

export function topSpendingCategory(
  totals: Record<string, number>
): { category: string; amount: number } | null {
  const entries = Object.entries(totals);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  const [category, amount] = entries[0];
  return { category, amount };
}
