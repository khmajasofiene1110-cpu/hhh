"use client";

import { getTransactionLabel } from "@/lib/transaction-label";
import { removeTransactionById } from "@/lib/transactions-storage";
import type { Transaction } from "@/lib/types/transaction";
import { Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import styles from "./SwipeableTransactionRow.module.css";

type SwipeableTransactionRowProps = {
  tx: Transaction;
  username: string;
  formatMoney: (n: number) => string;
  formatWhen: (iso: string) => string;
  onRemoved: () => void;
};

const SWIPE_COMMIT = 72;

export function SwipeableTransactionRow({
  tx,
  username,
  formatMoney,
  formatWhen,
  onRemoved,
}: SwipeableTransactionRowProps) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);
  const dragging = useRef(false);

  const close = useCallback(() => setOffset(0), []);

  const handleDelete = useCallback(() => {
    if (removeTransactionById(tx.id, username)) {
      onRemoved();
    }
    close();
  }, [tx.id, username, onRemoved, close]);

  function onTouchStart(e: React.TouchEvent) {
    dragging.current = true;
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragging.current) return;
    currentX.current = e.touches[0].clientX;
    const delta = currentX.current - startX.current;
    const next = Math.min(0, Math.max(-120, delta));
    setOffset(next);
  }

  function onTouchEnd() {
    if (!dragging.current) return;
    dragging.current = false;
    if (offset < -SWIPE_COMMIT) {
      setOffset(-88);
    } else {
      setOffset(0);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.swipeActions}>
        <button
          type="button"
          className={styles.deleteBtn}
          onClick={handleDelete}
          aria-label={`Delete transaction ${getTransactionLabel(tx)}`}
        >
          <Trash2 size={18} strokeWidth={2} aria-hidden />
        </button>
      </div>
      <div
        className={styles.row}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <div className={styles.main}>
          <p className={styles.label}>{getTransactionLabel(tx)}</p>
          <p className={styles.meta}>
            {tx.type === "income" ? "Income" : "Expense"} · {formatWhen(tx.timestamp)}
          </p>
        </div>
        <span
          className={`${styles.amount} ${
            tx.type === "income" ? styles.amountIn : styles.amountOut
          }`}
        >
          {tx.type === "income" ? "+" : "−"}
          {formatMoney(tx.amount)}
        </span>
        <button
          type="button"
          className={styles.desktopDelete}
          onClick={handleDelete}
          aria-label={`Delete transaction ${getTransactionLabel(tx)}`}
        >
          <Trash2 size={18} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
