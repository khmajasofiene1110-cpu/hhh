import { getGoalsForUser, saveGoalsForUser } from "@/lib/goals-storage";
import { getMonthlyIncomeAndExpenses } from "@/lib/transaction-analytics";
import type { SavingsGoal } from "@/lib/types/goal";
import {
  allocateSurplusWaterfall,
  type WaterfallAllocation,
} from "@/lib/waterfall";
import {
  currentMonthKey,
  getWaterfallLedger,
  setWaterfallLedger,
} from "./waterfall-ledger";

export type DistributionLine = {
  goalId: string;
  goalName: string;
  amount: number;
};

export type DistributeMonthlySavingsResult = {
  allocations: DistributionLine[];
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  alreadyDistributedThisMonth: number;
  poolAvailable: number;
  poolApplied: number;
  nextGoals: SavingsGoal[];
};

/**
 * Uses **current calendar month** income minus expenses as surplus.
 * Tracks how much of that surplus has already been moved into goals this month
 * so repeat clicks do not double-count until new income arrives.
 */
export function distributeMonthlySavings(
  username: string
): DistributeMonthlySavingsResult {
  const { income: monthlyIncome, expenses: monthlyExpenses } =
    getMonthlyIncomeAndExpenses(username);
  const monthlySurplus = monthlyIncome - monthlyExpenses;

  const mk = currentMonthKey();
  const ledger = getWaterfallLedger(username);
  const alreadyDistributedThisMonth =
    ledger.monthKey === mk ? ledger.distributed : 0;

  const poolAvailable = Math.max(0, monthlySurplus - alreadyDistributedThisMonth);

  const goals = getGoalsForUser(username);
  const rawAllocations: WaterfallAllocation[] = allocateSurplusWaterfall(
    poolAvailable,
    goals.map((g) => ({
      id: g.id,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      priority: g.priority,
    }))
  );

  const addById = new Map(rawAllocations.map((a) => [a.goalId, a.amount]));
  const nextGoals = goals.map((g) => ({
    ...g,
    currentAmount: g.currentAmount + (addById.get(g.id) ?? 0),
  }));

  const poolApplied = rawAllocations.reduce((s, a) => s + a.amount, 0);

  saveGoalsForUser(username, nextGoals);
  setWaterfallLedger(username, mk, alreadyDistributedThisMonth + poolApplied);

  const nameById = new Map(goals.map((g) => [g.id, g.name]));
  const allocations: DistributionLine[] = rawAllocations.map((a) => ({
    goalId: a.goalId,
    goalName: nameById.get(a.goalId) ?? "Goal",
    amount: a.amount,
  }));

  return {
    allocations,
    monthlyIncome,
    monthlyExpenses,
    monthlySurplus,
    alreadyDistributedThisMonth,
    poolAvailable,
    poolApplied,
    nextGoals,
  };
}
