export type AdminUserRow = {
  id: number;
  username: string;
  last_seen: string | null;
  expense_count: number;
};

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (base && base.trim()) return base.replace(/\/+$/, "");
  return "http://localhost:4000";
}

async function expectOk(res: Response): Promise<void> {
  if (res.ok) return;
  const text = await res.text().catch(() => "");
  const msg = text?.trim()
    ? text.trim()
    : `Request failed (${res.status} ${res.statusText})`;
  throw new Error(msg);
}

export async function fetchUsers(): Promise<AdminUserRow[]> {
  const res = await fetch(`${apiBase()}/admin/users`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  await expectOk(res);
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) throw new Error("Unexpected users response.");
  return data as AdminUserRow[];
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${apiBase()}/admin/users/${id}`, {
    method: "DELETE",
  });
  await expectOk(res);
}

