import { readStorageJson, writeStorageJson } from "@/lib/storage";
import type { CategoryBudget } from "@/lib/types/budget";

export const STORAGE_BUDGETS = "walletiq_budgets";

export function getAllBudgets(): CategoryBudget[] {
  return readStorageJson<CategoryBudget[]>(STORAGE_BUDGETS, []);
}

export function getBudgetsForUser(username: string): CategoryBudget[] {
  const u = username.trim().toLowerCase();
  return getAllBudgets().filter((b) => b.username.toLowerCase() === u);
}

export function getBudgetLimit(
  username: string,
  category: string
): number | null {
  const b = getBudgetsForUser(username).find((x) => x.category === category);
  return b ? b.monthlyLimit : null;
}

export function upsertBudget(
  username: string,
  category: string,
  monthlyLimit: number
): CategoryBudget {
  const uname = username.trim();
  const u = uname.toLowerCase();
  const all = getAllBudgets();
  const existing = all.find(
    (x) => x.username.toLowerCase() === u && x.category === category
  );
  const next: CategoryBudget = existing
    ? { ...existing, monthlyLimit }
    : {
        id: crypto.randomUUID(),
        username: uname,
        category,
        monthlyLimit,
      };
  const others = all.filter(
    (x) => !(x.username.toLowerCase() === u && x.category === category)
  );
  writeStorageJson(STORAGE_BUDGETS, [...others, next]);
  return next;
}

export function removeBudgetsForUser(username: string): void {
  const u = username.trim().toLowerCase();
  writeStorageJson(
    STORAGE_BUDGETS,
    getAllBudgets().filter((b) => b.username.toLowerCase() !== u)
  );
}
