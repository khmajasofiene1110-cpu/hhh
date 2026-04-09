"use client";

import { TransactionModal } from "@/components/transactions/TransactionModal";
import { useAuth } from "@/hooks/useAuth";
import { getBudgetsForUser } from "@/lib/budgets-storage";
import { formatMoneyDt } from "@/lib/format-money";
import { getTransactionLabel } from "@/lib/transaction-label";
import { getExpenseTotalsByCategoryThisMonth } from "@/lib/transaction-analytics";
import { getTransactionsForUser } from "@/lib/transactions-storage";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Receipt,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const username = user?.username ?? "";

  const transactions = useMemo(() => {
    if (!username) return [];
    return getTransactionsForUser(username);
  }, [username, version]);

  const { balance, monthlyIncome, monthlyExpenses } = useMemo(() => {
    let incomeTotal = 0;
    let expenseTotal = 0;
    let monthIn = 0;
    let monthOut = 0;
    const monthStart = startOfMonth(new Date()).getTime();

    for (const t of transactions) {
      const ts = new Date(t.timestamp).getTime();
      if (t.type === "income") {
        incomeTotal += t.amount;
        if (ts >= monthStart) monthIn += t.amount;
      } else {
        expenseTotal += t.amount;
        if (ts >= monthStart) monthOut += t.amount;
      }
    }
    return {
      balance: incomeTotal - expenseTotal,
      monthlyIncome: monthIn,
      monthlyExpenses: monthOut,
    };
  }, [transactions]);

  const recentActivities = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 12);
  }, [transactions]);

  const { budgetCap, spentAgainstBudget } = useMemo(() => {
    if (!username) return { budgetCap: 0, spentAgainstBudget: 0 };
    const cap = getBudgetsForUser(username).reduce((s, b) => s + b.monthlyLimit, 0);
    const byCat = getExpenseTotalsByCategoryThisMonth(username);
    const spent = Object.values(byCat).reduce((a, b) => a + b, 0);
    return { budgetCap: cap, spentAgainstBudget: spent };
  }, [username, version]);

  const budgetPct =
    budgetCap > 0 ? Math.min(100, (spentAgainstBudget / budgetCap) * 100) : 0;
  const budgetRemaining = Math.max(0, budgetCap - spentAgainstBudget);

  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModalOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  if (!user) return null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div>
            <p className={styles.greeting}>Hello,</p>
            <h1 className={styles.userName}>{user.fullName}</h1>
          </div>
          <Link
            href="/profile"
            className={styles.profileLink}
            aria-label="Open profile"
            prefetch
          >
            <User className={styles.profileIcon} strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </header>

      <section className={styles.cards} aria-label="Summary">
        <article className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>Total balance</span>
            <span className={styles.cardIcon} aria-hidden>
              <Wallet size={18} strokeWidth={2} />
            </span>
          </div>
          <p className={styles.cardValue}>{formatMoneyDt(balance)}</p>
        </article>

        <div className={styles.row}>
          <article className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardLabel}>Income</span>
              <span className={`${styles.cardIcon} ${styles.iconIncome}`} aria-hidden>
                <ArrowUpRight size={18} strokeWidth={2} />
              </span>
            </div>
            <p className={styles.cardValue}>{formatMoneyDt(monthlyIncome)}</p>
            <p className={styles.cardHint}>This month</p>
          </article>

          <article className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardLabel}>Expenses</span>
              <span className={`${styles.cardIcon} ${styles.iconExpense}`} aria-hidden>
                <ArrowDownLeft size={18} strokeWidth={2} />
              </span>
            </div>
            <p className={styles.cardValue}>{formatMoneyDt(monthlyExpenses)}</p>
            <p className={styles.cardHint}>This month</p>
          </article>
        </div>
      </section>

      {budgetCap > 0 ? (
        <section className={styles.budgetSection} aria-label="Budget overview">
          <h2 className={styles.budgetTitle}>Spent vs. budget (this month)</h2>
          <div className={styles.budgetRow}>
            <div
              className={styles.budgetRing}
              style={{
                background: `conic-gradient(var(--color-primary) 0deg ${
                  budgetPct * 3.6
                }deg, var(--color-surface) 0deg)`,
              }}
            >
              <div className={styles.budgetRingHole}>
                <span className={styles.budgetPct}>{Math.round(budgetPct)}%</span>
                <span className={styles.budgetPctLabel}>used</span>
              </div>
            </div>
            <div className={styles.budgetLegend}>
              <div className={styles.budgetLine}>
                <span className={styles.budgetDotSpent} aria-hidden />
                <span>Spent</span>
                <strong>{formatMoneyDt(spentAgainstBudget)}</strong>
              </div>
              <div className={styles.budgetLine}>
                <span className={styles.budgetDotLeft} aria-hidden />
                <span>Remaining</span>
                <strong>{formatMoneyDt(budgetRemaining)}</strong>
              </div>
              <p className={styles.budgetCap}>
                of {formatMoneyDt(budgetCap)} total monthly limits
              </p>
            </div>
          </div>
          <div className={styles.budgetBarTrack} aria-hidden>
            <div
              className={styles.budgetBarFill}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </section>
      ) : (
        <p className={styles.budgetHint}>
          Set category limits on the Budgets tab to see spending vs. budget here.
        </p>
      )}

      <button
        type="button"
        className={styles.newTx}
        onClick={() => setModalOpen(true)}
      >
        <Plus size={22} strokeWidth={2} aria-hidden />
        New transaction
      </button>

      <section className={styles.activitySection} aria-label="Recent activities">
        <h2 className={styles.sectionTitle}>Recent activities</h2>
        {recentActivities.length === 0 ? (
          <div className={styles.emptyActivity}>
            <Receipt className={styles.emptyIllustration} strokeWidth={1.5} aria-hidden />
            <p className={styles.emptyTitle}>No transactions yet</p>
            <p className={styles.emptyHint}>
              Tap &quot;New transaction&quot; to log income or spending. Your activity will show up
              here.
            </p>
          </div>
        ) : (
          <ul className={styles.activityList}>
            {recentActivities.map((tx) => (
              <li key={tx.id} className={styles.activityItem}>
                <div className={styles.activityMain}>
                  <p className={styles.activityLabel}>
                    {getTransactionLabel(tx)}
                  </p>
                  <p className={styles.activityMeta}>
                    {tx.type === "income" ? "Income" : "Expense"} ·{" "}
                    {formatWhen(tx.timestamp)}
                  </p>
                </div>
                <span
                  className={`${styles.activityAmount} ${
                    tx.type === "income" ? styles.amountIncome : styles.amountExpense
                  }`}
                >
                  {tx.type === "income" ? "+" : "−"}
                  {formatMoneyDt(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <TransactionModal
        open={modalOpen}
        username={username}
        onClose={() => setModalOpen(false)}
        onSaved={refresh}
      />
    </div>
  );
}
