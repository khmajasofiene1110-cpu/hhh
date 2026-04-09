"use client";

import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { useAuth } from "@/hooks/useAuth";
import { clearUserTransactions } from "@/lib/transactions-storage";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import styles from "./page.module.css";

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const handleSave = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setMsg(null);
      setErr(null);
      const r = updateProfile(fullName, username);
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      setMsg("Profile updated.");
    },
    [updateProfile, fullName, username]
  );

  function confirmReset() {
    if (!user) return;
    clearUserTransactions(user.username);
    setResetOpen(false);
    setMsg("All your transactions have been cleared. Goals and budgets were kept.");
  }

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.lead}>Update your account details</p>
      </div>

      <form className={styles.card} onSubmit={handleSave}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-name">
            Full name
          </label>
          <input
            id="pf-name"
            className={styles.input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-user">
            Username
          </label>
          <input
            id="pf-user"
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        {err ? <p className={styles.messageError}>{err}</p> : null}
        {msg ? <p className={styles.message}>{msg}</p> : null}
        <button type="submit" className={styles.save}>
          Save changes
        </button>
      </form>

      <section className={styles.dangerZone}>
        <h2 className={styles.dangerTitle}>Data & session</h2>
        <p className={styles.dangerText}>
          Reset data removes every transaction for your account in this browser.
          Your login and your savings goals and budgets stay as they are.
        </p>
        <button
          type="button"
          className={styles.reset}
          onClick={() => setResetOpen(true)}
        >
          Reset transaction data
        </button>
        <button
          type="button"
          className={styles.logout}
          onClick={() => {
            logout();
            router.replace("/");
          }}
        >
          <span className={styles.logoutInner}>
            <LogOut size={18} strokeWidth={2} aria-hidden />
            Log out
          </span>
        </button>
      </section>

      <ConfirmModal
        open={resetOpen}
        title="Reset transactions?"
        confirmLabel="Reset data"
        cancelLabel="Cancel"
        danger
        onCancel={() => setResetOpen(false)}
        onConfirm={confirmReset}
      >
        <p>This clears all transactions for your account. Goals and budgets are not removed.</p>
      </ConfirmModal>
    </div>
  );
}
