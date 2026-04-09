import { readStorageJson, writeStorageJson } from "@/lib/storage";
import type { SavingsGoal } from "@/lib/types/goal";

export const STORAGE_GOALS = "walletiq_goals";

export function getAllGoals(): SavingsGoal[] {
  return readStorageJson<SavingsGoal[]>(STORAGE_GOALS, []);
}

export function getGoalsForUser(username: string): SavingsGoal[] {
  const u = username.trim().toLowerCase();
  return getAllGoals().filter((g) => g.username.toLowerCase() === u);
}

export function saveGoalsForUser(username: string, goals: SavingsGoal[]): void {
  const u = username.trim().toLowerCase();
  const rest = getAllGoals().filter((g) => g.username.toLowerCase() !== u);
  writeStorageJson(STORAGE_GOALS, [...rest, ...goals]);
}

export function removeGoalsForUser(username: string): void {
  const u = username.trim().toLowerCase();
  writeStorageJson(
    STORAGE_GOALS,
    getAllGoals().filter((g) => g.username.toLowerCase() !== u)
  );
}
