"use client";

import { setAdminSessionActive } from "@/lib/admin-session";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => username.trim().length > 0 && password.length > 0,
    [username, password]
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const u = username.trim().toLowerCase();
    if (u === "admin" && password === "admin123") {
      setAdminSessionActive();
      router.replace("/admin");
      return;
    }
    setError("Invalid credentials.");
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight text-black/90">
            Admin Login
          </h1>
          <p className="text-sm text-black/50">
            Sign in to access the Master Admin Dashboard.
          </p>
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-black/60">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/20 focus:ring-2 focus:ring-violet-500/30"
              placeholder="admin"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-black/60">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/20 focus:ring-2 focus:ring-violet-500/30"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-violet-700/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

