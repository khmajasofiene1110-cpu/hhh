"use client";

import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import type { AdminUserRow } from "@/src/services/adminService";

function formatRelativeLastSeen(lastSeenIso: string | null): {
  label: string;
  title?: string;
  tone: "good" | "neutral" | "warn";
} {
  if (!lastSeenIso) return { label: "Jamais", tone: "warn" };
  const ts = Date.parse(lastSeenIso);
  if (Number.isNaN(ts)) return { label: "Inconnu", tone: "warn" };

  const diffMs = Date.now() - ts;
  const diffSec = Math.round(diffMs / 1000);

  const rtf = new Intl.RelativeTimeFormat("fr-TN", { numeric: "auto" });

  const abs = Math.abs(diffSec);
  let value: number;
  let unit: Intl.RelativeTimeFormatUnit;
  if (abs < 60) {
    value = -diffSec;
    unit = "second";
  } else if (abs < 60 * 60) {
    value = -Math.round(diffSec / 60);
    unit = "minute";
  } else if (abs < 24 * 60 * 60) {
    value = -Math.round(diffSec / (60 * 60));
    unit = "hour";
  } else if (abs < 30 * 24 * 60 * 60) {
    value = -Math.round(diffSec / (24 * 60 * 60));
    unit = "day";
  } else if (abs < 365 * 24 * 60 * 60) {
    value = -Math.round(diffSec / (30 * 24 * 60 * 60));
    unit = "month";
  } else {
    value = -Math.round(diffSec / (365 * 24 * 60 * 60));
    unit = "year";
  }

  const title = new Intl.DateTimeFormat("fr-TN", {
    timeZone: "Africa/Tunis",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));

  const days = Math.floor(abs / (24 * 60 * 60));
  const tone: "good" | "neutral" | "warn" =
    days <= 1 ? "good" : days <= 7 ? "neutral" : "warn";

  return { label: rtf.format(value, unit), title, tone };
}

export function UserTable({
  users,
  busyUserId,
  onDeleteClick,
}: {
  users: AdminUserRow[];
  busyUserId: number | null;
  onDeleteClick: (user: AdminUserRow) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.username.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 pb-4">
        <div className="flex-1">
          <label className="sr-only" htmlFor="admin-user-search">
            Search users
          </label>
          <input
            id="admin-user-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username…"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-black/40 focus:border-black/20 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        <div className="text-xs text-black/50">
          {filtered.length} / {users.length}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <div className="hidden grid-cols-[minmax(12rem,1.6fr)_minmax(10rem,1fr)_minmax(8rem,0.8fr)_minmax(10rem,auto)] gap-3 border-b border-black/10 bg-black/[0.02] px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-black/50 md:grid">
          <span>User info</span>
          <span>Status</span>
          <span>App usage</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-black/5">
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-black/50">
              No users match your search.
            </div>
          ) : (
            filtered.map((u) => {
              const lastSeen = formatRelativeLastSeen(u.last_seen);
              const badgeTone =
                lastSeen.tone === "good"
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10"
                  : lastSeen.tone === "neutral"
                    ? "bg-amber-50 text-amber-700 ring-amber-600/10"
                    : "bg-rose-50 text-rose-700 ring-rose-600/10";

              const deleting = busyUserId === u.id;

              return (
                <div
                  key={u.id}
                  className="grid grid-cols-1 gap-3 px-4 py-4 hover:bg-black/[0.015] md:grid-cols-[minmax(12rem,1.6fr)_minmax(10rem,1fr)_minmax(8rem,0.8fr)_minmax(10rem,auto)] md:items-center md:py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-black/90">
                      {u.username}
                    </div>
                    <div className="text-xs text-black/50">ID: {u.id}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      title={lastSeen.title}
                      className={[
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset",
                        badgeTone,
                      ].join(" ")}
                    >
                      Last seen: {lastSeen.label}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-black/80">
                    {u.expense_count}
                    <span className="ml-1 text-xs font-medium text-black/50">
                      expenses
                    </span>
                  </div>

                  <div className="flex justify-start md:justify-end">
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => onDeleteClick(u)}
                      className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-rose-700/20 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 size={14} strokeWidth={2} aria-hidden />
                      {deleting ? "Deleting…" : "Delete account"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

