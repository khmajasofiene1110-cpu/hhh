import { readStorageJson, writeStorageJson } from "@/lib/storage";

export const STORAGE_WATERFALL_LEDGER = "walletiq_waterfall_ledger";

export type WaterfallLedgerRow = {
  username: string;
  monthKey: string;
  distributed: number;
};

export function currentMonthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function allRows(): WaterfallLedgerRow[] {
  return readStorageJson<WaterfallLedgerRow[]>(STORAGE_WATERFALL_LEDGER, []);
}

export function getWaterfallLedger(username: string): {
  monthKey: string;
  distributed: number;
} {
  const u = username.trim().toLowerCase();
  const mk = currentMonthKey();
  const row = allRows().find((r) => r.username.toLowerCase() === u);
  if (!row || row.monthKey !== mk) {
    return { monthKey: mk, distributed: 0 };
  }
  return { monthKey: row.monthKey, distributed: row.distributed };
}

export function setWaterfallLedger(
  username: string,
  monthKey: string,
  distributed: number
): void {
  const uname = username.trim();
  const u = uname.toLowerCase();
  const rest = allRows().filter((r) => r.username.toLowerCase() !== u);
  writeStorageJson(STORAGE_WATERFALL_LEDGER, [
    ...rest,
    { username: uname, monthKey, distributed },
  ]);
}

export function removeWaterfallLedgerForUser(username: string): void {
  const u = username.trim().toLowerCase();
  writeStorageJson(
    STORAGE_WATERFALL_LEDGER,
    allRows().filter((r) => r.username.toLowerCase() !== u)
  );
}
