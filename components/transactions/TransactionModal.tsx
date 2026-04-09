"use client";

import { addTransaction } from "@/lib/transactions-storage";
import type { TransactionType } from "@/lib/types/transaction";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import styles from "./TransactionModal.module.css";

const CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Others"] as const;
const BILL_SUBCATEGORIES = ["SONEDE", "STEG", "Phone Top-up"] as const;
const PHONE_PROVIDERS = ["Ooredoo", "Orange", "Tunisie Telecom"] as const;

const BILLS = "Bills";
const PHONE_TOPUP = "Phone Top-up";

export type TransactionModalProps = {
  open: boolean;
  username: string;
  onClose: () => void;
  onSaved: () => void;
};

export function TransactionModal({ open, username, onClose, onSaved }: TransactionModalProps) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [subCategory, setSubCategory] = useState<string>(BILL_SUBCATEGORIES[0]);
  const [provider, setProvider] = useState<string>(PHONE_PROVIDERS[0]);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setAmount("");
    setType("expense");
    setCategory(CATEGORIES[0]);
    setSubCategory(BILL_SUBCATEGORIES[0]);
    setProvider(PHONE_PROVIDERS[0]);
    setError(null);
  }, []);

  // Avoid setState-in-effect lint by resetting/normalizing state in event handlers.

  if (!open) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      resetForm();
      onClose();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const num = Number.parseFloat(amount);
    if (!Number.isFinite(num) || num <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }
    if (category === BILLS) {
      if (!subCategory) {
        setError("Select a bills sub-category.");
        return;
      }
      if (subCategory === PHONE_TOPUP && !provider) {
        setError("Select a provider.");
        return;
      }
    }

    const sub =
      category === BILLS ? subCategory : null;
    const prov =
      category === BILLS && subCategory === PHONE_TOPUP ? provider : null;

    addTransaction({
      username,
      amount: num,
      type,
      category,
      subCategory: sub,
      provider: prov,
      timestamp: new Date().toISOString(),
    });
    onSaved();
    resetForm();
    onClose();
  }

  function setCategorySafe(next: string) {
    setCategory(next);
    if (next === BILLS) {
      setSubCategory(BILL_SUBCATEGORIES[0]);
      setProvider(PHONE_PROVIDERS[0]);
    }
  }

  function setSubCategorySafe(next: string) {
    setSubCategory(next);
    if (next === PHONE_TOPUP) {
      setProvider(PHONE_PROVIDERS[0]);
    }
  }

  const showSubCategory = category === BILLS;
  const showProvider = category === BILLS && subCategory === PHONE_TOPUP;

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tx-modal-title"
      >
        <header className={styles.header}>
          <h2 id="tx-modal-title" className={styles.title}>
            New transaction
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={() => {
              resetForm();
              onClose();
            }}
            aria-label="Close"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Amount
            <input
              className={styles.input}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>

          <fieldset className={styles.typeFieldset}>
            <legend className={styles.legend}>Type</legend>
            <div className={styles.typeRow}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="tx-type"
                  checked={type === "income"}
                  onChange={() => setType("income")}
                />
                Income
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="tx-type"
                  checked={type === "expense"}
                  onChange={() => setType("expense")}
                />
                Expense
              </label>
            </div>
          </fieldset>

          <label className={styles.label}>
            Category
            <select
              className={styles.select}
              value={category}
                onChange={(e) => setCategorySafe(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {showSubCategory ? (
            <label className={styles.label}>
              Sub-category
              <select
                className={styles.select}
                value={subCategory}
                onChange={(e) => setSubCategorySafe(e.target.value)}
              >
                {BILL_SUBCATEGORIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {showProvider ? (
            <label className={styles.label}>
              Provider
              <select
                className={styles.select}
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                {PHONE_PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.save}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
