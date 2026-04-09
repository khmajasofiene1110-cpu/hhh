"use client";

import { ConfettiBurst } from "@/components/ui/ConfettiBurst";
import { useAuth } from "@/hooks/useAuth";
import { formatMoneyDt } from "@/lib/format-money";
import { getGoalsForUser, saveGoalsForUser } from "@/lib/goals-storage";
import { distributeMonthlySavings } from "@/lib/logic/waterfall";
import { currentMonthKey, getWaterfallLedger } from "@/lib/logic/waterfall-ledger";
import {
  getMonthlyIncomeAndExpenses,
  getTotalsForUser,
} from "@/lib/transaction-analytics";
import type { SavingsGoal } from "@/lib/types/goal";
import type { GoalPriority } from "@/lib/waterfall";
import { Target } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import styles from "./page.module.css";

const PRIORITIES: { value: GoalPriority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function priorityRank(p: GoalPriority): number {
  return p === "high" ? 0 : p === "medium" ? 1 : 2;
}

function sortGoals(list: SavingsGoal[]): SavingsGoal[] {
  return [...list].sort((a, b) => {
    const d = priorityRank(a.priority) - priorityRank(b.priority);
    if (d !== 0) return d;
    return a.name.localeCompare(b.name);
  });
}

function badgeClass(p: GoalPriority): string {
  if (p === "high") return styles.badge;
  if (p === "medium") return `${styles.badge} ${styles.badgeMedium}`;
  return `${styles.badge} ${styles.badgeLow}`;
}

export default function GoalsPage() {
  const { user } = useAuth();
  const [version, setVersion] = useState(0);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [priority, setPriority] = useState<GoalPriority>("medium");
  const [confetti, setConfetti] = useState(false);
  const [successLines, setSuccessLines] = useState<
    { goalName: string; amount: number }[] | null
  >(null);
  const [infoNote, setInfoNote] = useState<string | null>(null);

  const username = user?.username ?? "";

  const goals = useMemo(() => {
    if (!username) return [];
    return sortGoals(getGoalsForUser(username));
  }, [username, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const { monthlyIncome, monthlyExpenses, monthlySurplus, distributed, poolPreview } =
    useMemo(() => {
      if (!username) {
        return {
          monthlyIncome: 0,
          monthlyExpenses: 0,
          monthlySurplus: 0,
          distributed: 0,
          poolPreview: 0,
        };
      }
      const m = getMonthlyIncomeAndExpenses(username);
      const mk = currentMonthKey();
      const led = getWaterfallLedger(username);
      const dist = led.monthKey === mk ? led.distributed : 0;
      const surplus = m.income - m.expenses;
      return {
        monthlyIncome: m.income,
        monthlyExpenses: m.expenses,
        monthlySurplus: surplus,
        distributed: dist,
        poolPreview: Math.max(0, surplus - dist),
      };
    }, [username, version]);

  const { netBalance, committed } = useMemo(() => {
    if (!username) return { netBalance: 0, committed: 0 };
    const t = getTotalsForUser(username);
    const c = getGoalsForUser(username).reduce((s, g) => s + g.currentAmount, 0);
    return { netBalance: t.netBalance, committed: c };
  }, [username, version]);

  function addGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const t = Number.parseFloat(target);
    if (!name.trim() || !Number.isFinite(t) || t <= 0) return;
    const next: SavingsGoal = {
      id: crypto.randomUUID(),
      username: user.username,
      name: name.trim(),
      targetAmount: t,
      currentAmount: 0,
      priority,
    };
    saveGoalsForUser(user.username, [...getGoalsForUser(user.username), next]);
    setName("");
    setTarget("");
    setPriority("medium");
    refresh();
  }

  function runWaterfall() {
    if (!user) return;
    setInfoNote(null);
    setSuccessLines(null);
    const r = distributeMonthlySavings(user.username);
    refresh();
    if (r.poolApplied > 0) {
      setSuccessLines(
        r.allocations.map((a) => ({ goalName: a.goalName, amount: a.amount }))
      );
      setConfetti(true);
    } else if (r.poolAvailable <= 0) {
      setInfoNote(
        monthlySurplus <= 0
          ? "No monthly surplus yet. Add more income than expenses this month to distribute savings."
          : "This month’s surplus has already been moved into your goals. Add new income to unlock more."
      );
    } else {
      setInfoNote("All goals are already full for the amount available.");
    }
  }

  if (!user) return null;

  return (
    <div className={styles.page}>
      <ConfettiBurst active={confetti} onDone={() => setConfetti(false)} />

      <div>
        <h1 className={styles.title}>Savings goals</h1>
        <p className={styles.lead}>
          High-priority goals fill first, then medium, then low. Distribution uses this
          month’s income minus this month’s expenses.
        </p>
        <div className={styles.summary}>
          <span>
            This month income: <strong>{formatMoneyDt(monthlyIncome)}</strong>
          </span>
          <span>
            This month expenses: <strong>{formatMoneyDt(monthlyExpenses)}</strong>
          </span>
          <span>
            Monthly surplus: <strong>{formatMoneyDt(monthlySurplus)}</strong>
          </span>
          <span>
            Already distributed: <strong>{formatMoneyDt(distributed)}</strong>
          </span>
          <span>
            Pool to assign: <strong>{formatMoneyDt(poolPreview)}</strong>
          </span>
          <span>
            All-time balance: <strong>{formatMoneyDt(netBalance)}</strong> · In goals:{" "}
            <strong>{formatMoneyDt(committed)}</strong>
          </span>
        </div>
      </div>

      <button
        type="button"
        className={styles.distribute}
        onClick={runWaterfall}
        disabled={goals.length === 0 || poolPreview <= 0}
      >
        Distribute monthly savings
      </button>

      {successLines && successLines.length > 0 ? (
        <div className={styles.successCard} role="status">
          <p className={styles.successTitle}>Savings distributed</p>
          <ul className={styles.successList}>
            {successLines.map((line, i) => (
              <li key={i}>
                <strong>{line.goalName}</strong>
                <span>+{formatMoneyDt(line.amount)}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={styles.dismiss}
            onClick={() => setSuccessLines(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {infoNote ? (
        <p className={styles.infoNote}>{infoNote}</p>
      ) : null}

      <form className={styles.formCard} onSubmit={addGoal}>
        <h2 className={styles.formTitle}>New goal</h2>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="goal-name">
            Name
          </label>
          <input
            id="goal-name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emergency Fund"
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="goal-target">
            Target amount (DT)
          </label>
          <input
            id="goal-target"
            className={styles.input}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="goal-priority">
            Priority
          </label>
          <select
            id="goal-priority"
            className={styles.select}
            value={priority}
            onChange={(e) => setPriority(e.target.value as GoalPriority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={styles.addBtn}>
          Add goal
        </button>
      </form>

      {goals.length === 0 ? (
        <div className={styles.empty}>
          <Target className={styles.emptyIcon} strokeWidth={1.5} aria-hidden />
          <p className={styles.emptyTitle}>You haven&apos;t set any goals yet!</p>
          <p className={styles.emptyHint}>
            Add a goal with a target and priority, then tap &quot;Distribute monthly
            savings&quot; when you have a positive surplus for the month.
          </p>
        </div>
      ) : (
        <ul className={styles.goalsList}>
          {goals.map((g) => {
            const pct = Math.min(
              100,
              g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
            );
            const pLabel = PRIORITIES.find((x) => x.value === g.priority)?.label ?? g.priority;
            return (
              <li key={g.id} className={styles.goalCard}>
                <div className={styles.goalHead}>
                  <span className={styles.goalName}>{g.name}</span>
                  <span className={badgeClass(g.priority)}>{pLabel}</span>
                </div>
                <p className={styles.amounts}>
                  <strong>{formatMoneyDt(g.currentAmount)}</strong> of{" "}
                  <strong>{formatMoneyDt(g.targetAmount)}</strong>
                </p>
                <div className={styles.track}>
                  <div className={styles.fill} style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
