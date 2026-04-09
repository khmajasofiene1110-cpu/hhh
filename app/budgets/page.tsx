"use client";

import { useAuth } from "@/hooks/useAuth";
import { BUDGET_CATEGORIES } from "@/lib/categories";
import { formatMoneyDt } from "@/lib/format-money";
import { getBudgetLimit, upsertBudget } from "@/lib/budgets-storage";
import { getExpenseTotalsByCategoryThisMonth } from "@/lib/transaction-analytics";
import { useCallback, useMemo, useState } from "react";
import styles from "./Budgets.module.css";

const WARNING_RATIO = 0.8;

export default function BudgetsPage() {
  const { user } = useAuth();
  const [version, setVersion] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const username = user?.username ?? "";

  const spendByCat = useMemo(() => {
    if (!username) return {};
    return getExpenseTotalsByCategoryThisMonth(username);
  }, [username, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  function draftKey(cat: string): string {
    const lim = username ? getBudgetLimit(username, cat) : null;
    if (drafts[cat] !== undefined) return drafts[cat];
    return lim != null ? String(lim) : "";
  }

  function saveLimit(category: string) {
    if (!user) return;
    const raw = drafts[category] ?? "";
    const n = Number.parseFloat(raw);
    if (!Number.isFinite(n) || n < 0) return;
    upsertBudget(user.username, category, n);
    refresh();
  }

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Budgets</h1>
        <p className={styles.lead}>
          Monthly limits per category. Bars turn warning red at 80% or more of the limit.
        </p>
      </div>

      <div className={styles.list}>
        {BUDGET_CATEGORIES.map((category) => {
          const limit = getBudgetLimit(username, category);
          const spent = spendByCat[category] ?? 0;
          const hasLimit = limit != null && limit > 0;
          const pct = hasLimit ? Math.min(100, (spent / limit) * 100) : 0;
          const warn = hasLimit && spent >= WARNING_RATIO * limit;

          return (
            <div key={category} className={styles.row}>
              <div className={styles.rowHead}>
                <span className={styles.category}>{category}</span>
                <form
                  className={styles.limitForm}
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveLimit(category);
                  }}
                >
                  <input
                    className={styles.limitInput}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    placeholder="Limit"
                    aria-label={`Monthly limit in DT for ${category}`}
                    value={draftKey(category)}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [category]: e.target.value }))
                    }
                  />
                  <span className={styles.dtSuffix}>DT</span>
                  <button type="submit" className={styles.saveBtn}>
                    Save
                  </button>
                </form>
              </div>
              <p className={styles.meta}>
                Spent this month: <strong>{formatMoneyDt(spent)}</strong>
                {hasLimit ? (
                  <>
                    {" "}
                    / limit <strong>{formatMoneyDt(limit)}</strong>
                  </>
                ) : (
                  <> — set a limit to track</>
                )}
              </p>
              <div className={styles.track}>
                <div
                  className={`${styles.fill} ${warn ? styles.fillWarning : ""}`}
                  style={{ width: hasLimit ? `${pct}%` : "0%" }}
                />
              </div>
              {warn ? (
                <p className={styles.hint}>80% or more of budget used</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
