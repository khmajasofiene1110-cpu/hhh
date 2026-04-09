/**
 * Waterfall savings model (for Goals phase):
 * Remains = monthlyIncome − monthlyExpenses.
 * Allocate Remains to goals sorted by priority: High → Medium → Low.
 * Each goal receives funds until it reaches its target, then overflow flows to the next goal.
 */

export type GoalPriority = "high" | "medium" | "low";

const priorityRank: Record<GoalPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export type WaterfallGoalInput = {
  id: string;
  targetAmount: number;
  currentAmount: number;
  priority: GoalPriority;
};

export type WaterfallAllocation = {
  goalId: string;
  amount: number;
};

export function computeMonthlyRemains(
  monthlyIncome: number,
  monthlyExpenses: number
): number {
  return monthlyIncome - monthlyExpenses;
}

/**
 * Distributes `remains` across goals in priority order until money runs out or all caps are met.
 */
export function allocateSurplusWaterfall(
  remains: number,
  goals: WaterfallGoalInput[]
): WaterfallAllocation[] {
  if (remains <= 0 || goals.length === 0) return [];
  const ordered = [...goals].sort(
    (a, b) => priorityRank[a.priority] - priorityRank[b.priority]
  );
  let pool = remains;
  const allocations: WaterfallAllocation[] = [];
  for (const g of ordered) {
    if (pool <= 0) break;
    const room = Math.max(0, g.targetAmount - g.currentAmount);
    const add = Math.min(pool, room);
    if (add > 0) {
      allocations.push({ goalId: g.id, amount: add });
      pool -= add;
    }
  }
  return allocations;
}
