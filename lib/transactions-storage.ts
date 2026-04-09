import { removeWaterfallLedgerForUser } from "@/lib/logic/waterfall-ledger";
import { readStorageJson, writeStorageJson } from "@/lib/storage";
import type { Transaction } from "@/lib/types/transaction";

export const STORAGE_TRANSACTIONS = "walletiq_transactions";

export function getAllTransactions(): Transaction[] {
  return readStorageJson<Transaction[]>(STORAGE_TRANSACTIONS, []);
}

export function getTransactionsForUser(username: string): Transaction[] {
  const u = username.trim().toLowerCase();
  return getAllTransactions().filter((t) => t.username.toLowerCase() === u);
}

export function addTransaction(tx: Omit<Transaction, "id">): Transaction {
  const full: Transaction = { ...tx, id: crypto.randomUUID() };
  const all = getAllTransactions();
  writeStorageJson(STORAGE_TRANSACTIONS, [...all, full]);
  return full;
}

export function removeTransactionsForUser(username: string): void {
  const u = username.trim().toLowerCase();
  writeStorageJson(
    STORAGE_TRANSACTIONS,
    getAllTransactions().filter((t) => t.username.toLowerCase() !== u)
  );
}

/** Clears all transactions for the user; account row in `walletiq_users` is unchanged. */
export function clearUserTransactions(username: string): void {
  removeTransactionsForUser(username);
  removeWaterfallLedgerForUser(username);
}

export function removeTransactionById(
  id: string,
  username: string
): boolean {
  const u = username.trim().toLowerCase();
  const all = getAllTransactions();
  const exists = all.some(
    (t) => t.id === id && t.username.toLowerCase() === u
  );
  if (!exists) return false;
  writeStorageJson(
    STORAGE_TRANSACTIONS,
    all.filter((t) => t.id !== id)
  );
  return true;
}
