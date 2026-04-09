import { purgeUserData } from "@/lib/purge-user-data";
import { readStorageJson, removeStorageKey, writeStorageJson } from "@/lib/storage";
import type { User } from "@/lib/types/user";

export const STORAGE_USERS = "walletiq_users";
export const STORAGE_SESSION = "walletiq_session";

/** Default admin for local dev; change in production. */
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "admin123";

function nowIso(): string {
  return new Date().toISOString();
}

function buildDefaultAdmin(): User {
  return {
    id: crypto.randomUUID(),
    username: DEFAULT_ADMIN_USERNAME,
    password: DEFAULT_ADMIN_PASSWORD,
    fullName: "Administrator",
    createdAt: nowIso(),
    lastActive: nowIso(),
    isAdmin: true,
  };
}

export function getUsers(): User[] {
  const raw = readStorageJson<User[]>(STORAGE_USERS, []);
  const hasAdmin = raw.some(
    (u) => u.username.toLowerCase() === DEFAULT_ADMIN_USERNAME.toLowerCase()
  );
  if (hasAdmin) return raw;
  const seeded = [...raw, buildDefaultAdmin()];
  saveUsers(seeded);
  return seeded;
}

export function saveUsers(users: User[]): void {
  writeStorageJson(STORAGE_USERS, users);
}

export function getSessionUsername(): string | null {
  return readStorageJson<string | null>(STORAGE_SESSION, null);
}

export function setSession(username: string): void {
  writeStorageJson(STORAGE_SESSION, username);
}

export function clearSession(): void {
  removeStorageKey(STORAGE_SESSION);
}

export function findUserByUsername(username: string): User | undefined {
  return getUsers().find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
}

export function updateUserLastActive(username: string): void {
  const users = getUsers();
  const i = users.findIndex(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (i === -1) return;
  const next = [...users];
  next[i] = { ...next[i], lastActive: nowIso() };
  saveUsers(next);
}

export function updateUserProfile(
  currentUsername: string,
  next: { fullName: string; username: string }
): { ok: true; user: User } | { ok: false; error: string } {
  const name = next.fullName.trim();
  const uname = next.username.trim();
  if (!name) return { ok: false, error: "Full name is required." };
  if (!uname) return { ok: false, error: "Username is required." };

  const users = getUsers();
  const i = users.findIndex(
    (u) => u.username.toLowerCase() === currentUsername.trim().toLowerCase()
  );
  if (i === -1) return { ok: false, error: "User not found." };
  if (
    users.some(
      (u, j) =>
        j !== i && u.username.toLowerCase() === uname.toLowerCase()
    )
  ) {
    return { ok: false, error: "Username is already taken." };
  }

  const updated: User = { ...users[i], fullName: name, username: uname };
  const nextUsers = [...users];
  nextUsers[i] = updated;
  saveUsers(nextUsers);

  const session = getSessionUsername();
  if (
    session &&
    session.toLowerCase() === currentUsername.trim().toLowerCase()
  ) {
    setSession(uname);
  }
  return { ok: true, user: updated };
}

export function deleteUser(username: string): boolean {
  const u = username.trim().toLowerCase();
  const users = getUsers();
  const idx = users.findIndex((x) => x.username.toLowerCase() === u);
  if (idx === -1) return false;

  purgeUserData(users[idx].username);

  const nextUsers = users.filter((x) => x.username.toLowerCase() !== u);
  saveUsers(nextUsers);

  const session = getSessionUsername();
  if (session && session.toLowerCase() === u) {
    clearSession();
  }
  return true;
}
