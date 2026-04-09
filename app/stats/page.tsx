"use client";

import { SwipeableTransactionRow } from "@/components/stats/SwipeableTransactionRow";
import { useAuth } from "@/hooks/useAuth";
import { formatMoneyDt } from "@/lib/format-money";
import {
  getExpenseTotalsByCategoryThisMonth,
  topSpendingCategory,
} from "@/lib/transaction-analytics";
import { getTransactionsForUser } from "@/lib/transactions-storage";
import { useCallback, useMemo, useState } from "react";
import styles from "./page.module.css";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function StatsPage() {
  const { user } = useAuth();
  const [version, setVersion] = useState(0);

  const username = user?.username ?? "";

  const totals = useMemo(() => {
    if (!username) return {};
    return getExpenseTotalsByCategoryThisMonth(username);
  }, [username, version]);

  const transactions = useMemo(() => {
    if (!username) return [];
    return [...getTransactionsForUser(username)].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [username, version]);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const top = useMemo(() => topSpendingCategory(totals), [totals]);

  const sorted = useMemo(() => {
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [totals]);

  const max = sorted[0]?.[1] ?? 0;

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Statistics</h1>
        <p className={styles.lead}>Spending by category and full transaction list.</p>
      </div>

      {top && top.amount > 0 ? (
        <div className={styles.topCard}>
          <p className={styles.topLabel}>Top spending category</p>
          <p className={styles.topValue}>
            {top.category} · {formatMoneyDt(top.amount)}
          </p>
        </div>
      ) : (
        <div className={styles.topCard}>
          <p className={styles.topLabel}>Top spending category</p>
          <p className={styles.topValue}>No expenses yet this month</p>
        </div>
      )}

      {sorted.length === 0 || sorted.every(([, v]) => v === 0) ? (
        <p className={styles.empty}>No category spending recorded this month.</p>
      ) : (
        <ul className={styles.list}>
          {sorted.map(([cat, amount]) => {
            if (amount <= 0) return null;
            const pct = max > 0 ? (amount / max) * 100 : 0;
            return (
              <li key={cat} className={styles.row}>
                <div className={styles.rowHead}>
                  <span>{cat}</span>
                  <span className={styles.amount}>{formatMoneyDt(amount)}</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section className={styles.txSection} aria-label="All transactions">
        <h2 className={styles.sectionTitle}>Transactions</h2>
        <p className={styles.swipeHint}>
          On your phone, swipe left on a row to delete a mistake. On desktop, use the trash
          icon.
        </p>
        {transactions.length === 0 ? (
          <p className={styles.empty}>No transactions yet.</p>
        ) : (
          <ul className={styles.txList}>
            {transactions.map((tx) => (
              <li key={tx.id} className={styles.txItem}>
                <SwipeableTransactionRow
                  tx={tx}
                  username={username}
                  formatMoney={formatMoneyDt}
                  formatWhen={formatWhen}
                  onRemoved={bump}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
