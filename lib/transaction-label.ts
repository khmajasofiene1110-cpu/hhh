import type { Transaction } from "@/lib/types/transaction";

/** Human-readable label for dashboard / lists (nested Bills + provider). */
export function getTransactionLabel(tx: Transaction): string {
  const parts: string[] = [tx.category];
  if (tx.subCategory) parts.push(tx.subCategory);
  if (tx.provider) parts.push(tx.provider);
  return parts.join(" · ");
}
