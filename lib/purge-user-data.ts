import { removeBudgetsForUser } from "@/lib/budgets-storage";
import { removeGoalsForUser } from "@/lib/goals-storage";
import { removeWaterfallLedgerForUser } from "@/lib/logic/waterfall-ledger";
import { removeTransactionsForUser } from "@/lib/transactions-storage";

export function purgeUserData(username: string): void {
  removeTransactionsForUser(username);
  removeGoalsForUser(username);
  removeBudgetsForUser(username);
  removeWaterfallLedgerForUser(username);
}
