"use client";

import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./AuthLanding.module.css";

type Mode = "login" | "signup";

export function AuthLanding() {
  const { user, loading, login, signup } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    router.replace("/dashboard");
  }, [user, loading, router]);

  useEffect(() => {
    setError(null);
  }, [mode]);

  if (loading || user) {
    return (
      <div className={styles.state} aria-busy="true">
        <Spinner label={user ? "Redirecting" : "Loading"} />
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        const result = login(username, password);
        if (!result.ok) {
          setError(result.error);
          return;
        }
      } else {
        const result = signup(fullName, username, password);
        if (!result.ok) {
          setError(result.error);
          return;
        }
      }
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.brandIcon} aria-hidden>
          <Wallet className={styles.brandSvg} strokeWidth={2} />
        </div>
        <h1 className={styles.title}>WalletIQ</h1>
        <p className={styles.subtitle}>Sign in to manage your money.</p>
      </header>

      <div className={styles.toggle} role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          className={`${styles.tab} ${mode === "login" ? styles.tabActive : ""}`}
          onClick={() => setMode("login")}
        >
          Log in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className={`${styles.tab} ${mode === "signup" ? styles.tabActive : ""}`}
          onClick={() => setMode("signup")}
        >
          Sign up
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {mode === "signup" && (
          <label className={styles.label}>
            Full name
            <input
              className={styles.input}
              name="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>
        )}
        <label className={styles.label}>
          Username
          <input
            className={styles.input}
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            name="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
