/**
 * @deprecated Use `distributeMonthlySavings` from `@/lib/logic/waterfall` instead.
 * Kept as a thin wrapper for any stale imports.
 */
import { distributeMonthlySavings } from "@/lib/logic/waterfall";

export function distributeMonthlySurplus(username: string) {
  return distributeMonthlySavings(username);
}
