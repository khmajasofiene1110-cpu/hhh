"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export type DashboardUserRow = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  lastSeenLabel: string;
};

export function Table({
  rows,
  onDeleteClick,
}: {
  rows: DashboardUserRow[];
  onDeleteClick: (row: DashboardUserRow) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 pb-4">
        <div className="flex-1">
          <label className="sr-only" htmlFor="admin-table-search">
            Search users
          </label>
          <input
            id="admin-table-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-black/20 focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="px-5 pb-4 pt-5">
          <div className="text-base font-semibold text-black/90">
            Registered Users Database
          </div>
          <div className="mt-1 text-sm text-black/45">
            Manage all user accounts and permissions
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="border-t border-black/10 bg-black/[0.02] text-left text-xs font-semibold text-black/50">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Created At</th>
                <th className="px-5 py-3">Last Seen</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-black/45"
                  >
                    No users match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-black/5 hover:bg-black/[0.015]"
                  >
                    <td className="px-5 py-4 text-xs text-black/50">
                      {String(row.id).slice(0, 6)}...
                    </td>
                    <td className="px-5 py-4 font-semibold text-black/80">
                      {row.name}
                    </td>
                    <td className="px-5 py-4 text-black/60">{row.email}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-600/10">
                        <span className="h-2 w-2 rounded-full bg-violet-500" />
                        {row.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-black/60">{row.createdAt}</td>
                    <td className="px-5 py-4 text-black/60">
                      {row.lastSeenLabel}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-3 text-black/50">
                        <button
                          type="button"
                          className="rounded-md p-1.5 hover:bg-black/5"
                          aria-label="Edit"
                        >
                          <Pencil size={16} aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteClick(row)}
                          className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

