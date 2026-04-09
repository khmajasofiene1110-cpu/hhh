import type { GoalPriority } from "@/lib/waterfall";

export type SavingsGoal = {
  id: string;
  username: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  priority: GoalPriority;
};
