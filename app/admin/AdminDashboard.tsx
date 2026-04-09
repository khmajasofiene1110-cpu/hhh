"use client";

import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { StatCard } from "@/components/admin/StatCard";
import { Table, type DashboardUserRow } from "@/components/admin/Table";
import { clearAdminSession } from "@/lib/admin-session";
import {
  fetchUsers,
  deleteUser as apiDeleteUser,
  type AdminUserRow,
} from "@/src/services/adminService";
import { Shield, UserRound, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function formatCreatedAt(isoOrNull: string | null): string {
  if (!isoOrNull) return "-";
  const ts = Date.parse(isoOrNull);
  if (Number.isNaN(ts)) return "-";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(ts));
}

function lastSeenLabel(user: AdminUserRow): string {
  if (user.username.trim().toLowerCase() === "admin") return "Online Now";
  if (!user.last_seen) return "Inactive";
  const ts = Date.parse(user.last_seen);
  if (Number.isNaN(ts)) return "Inactive";
  const diffSec = Math.round((Date.now() - ts) / 1000);
  const abs = Math.abs(diffSec);

  if (abs < 60) return `Active ${abs}s ago`;
  if (abs < 60 * 60) return `Active ${Math.round(abs / 60)} mins ago`;
  if (abs < 24 * 60 * 60) return `Active ${Math.round(abs / (60 * 60))} hrs ago`;
  if (abs < 48 * 60 * 60) return "Yesterday";
  return `Active ${Math.round(abs / (24 * 60 * 60))} days ago`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [pendingDelete, setPendingDelete] = useState<DashboardUserRow | null>(
    null
  );

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u.username.trim().toLowerCase() === "admin")
        .length,
    }),
    [users]
  );

  const regularUsers = stats.total - stats.admins;

  const tableRows = useMemo<DashboardUserRow[]>(() => {
    return users.map((u) => {
      const isAdmin = u.username.trim().toLowerCase() === "admin";
      return {
        id: u.id,
        name: isAdmin ? "Admin" : u.username,
        email: isAdmin ? "admin@gmail.com" : `${u.username}@gmail.com`,
        role: isAdmin ? "ADMIN" : "USER",
        createdAt: formatCreatedAt(u.last_seen),
        lastSeenLabel: lastSeenLabel(u),
      };
    });
  }, [users]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchUsers();
      setUsers(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await apiDeleteUser(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete user.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm">
            W
          </div>
          <div className="flex flex-col">
            <div className="text-base font-semibold text-black/90">
              Master Admin Dashboard
            </div>
            <div className="text-xs text-black/40">WalletIQ Management System</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            clearAdminSession();
            router.replace("/admin/login");
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/70 shadow-sm hover:bg-black/[0.02]"
        >
          Logout
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats.total}
          subtitle="Registered accounts"
          accent="blue"
          icon={<Users size={18} aria-hidden />}
        />
        <StatCard
          title="Regular Users"
          value={regularUsers}
          subtitle="Standard accounts"
          accent="green"
          icon={<UserRound size={18} aria-hidden />}
        />
        <StatCard
          title="Administrators"
          value={stats.admins}
          subtitle="Admin accounts"
          accent="purple"
          icon={<Shield size={18} aria-hidden />}
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
          <button
            type="button"
            onClick={() => void load()}
            className="ml-3 inline-flex rounded-md bg-white px-2 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="rounded-2xl bg-white/0">
        {loading ? (
          <div className="rounded-xl border border-black/10 bg-white px-4 py-10 text-center text-sm text-black/50">
            Loading users…
          </div>
        ) : (
          <Table
            rows={tableRows}
            onDeleteClick={(row) => setPendingDelete(row)}
          />
        )}
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete account?"
        confirmLabel="Delete account"
        cancelLabel="Cancel"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      >
        {pendingDelete ? (
          <p>
            This will permanently remove <strong>{pendingDelete.name}</strong>{" "}
            (ID <strong>{pendingDelete.id}</strong>) and all related data. This
            cannot be undone.
          </p>
        ) : null}
      </ConfirmModal>
    </div>
  );
}

