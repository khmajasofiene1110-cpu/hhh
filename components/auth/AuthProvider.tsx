"use client";

import {
  clearSession,
  findUserByUsername,
  getSessionUsername,
  getUsers,
  saveUsers,
  setSession,
  updateUserLastActive,
  updateUserProfile,
} from "@/lib/auth-storage";
import type { User } from "@/lib/types/user";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => { ok: true } | { ok: false; error: string };
  signup: (
    fullName: string,
    username: string,
    password: string
  ) => { ok: true } | { ok: false; error: string };
  updateProfile: (
    fullName: string,
    username: string
  ) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function syncUserFromSession(): User | null {
  const sessionUser = getSessionUsername();
  if (!sessionUser) return null;
  return findUserByUsername(sessionUser) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => syncUserFromSession());
  const [loading] = useState(false);

  const refreshUser = useCallback(() => {
    setUser(syncUserFromSession());
  }, []);

  // Avoid setState-in-effect lint by seeding initial state from session.

  const login = useCallback((username: string, password: string) => {
    const trimmed = username.trim();
    const u = findUserByUsername(trimmed);
    if (!u) return { ok: false as const, error: "Invalid username or password." };
    if (u.password !== password)
      return { ok: false as const, error: "Invalid username or password." };
    setSession(u.username);
    updateUserLastActive(u.username);
    const refreshed = findUserByUsername(u.username) ?? u;
    setUser(refreshed);
    return { ok: true as const };
  }, []);

  const signup = useCallback((fullName: string, username: string, password: string) => {
    const name = fullName.trim();
    const uname = username.trim();
    if (!name) return { ok: false as const, error: "Full name is required." };
    if (!uname) return { ok: false as const, error: "Username is required." };
    if (!password) return { ok: false as const, error: "Password is required." };
    const users = getUsers();
    if (users.some((u) => u.username.toLowerCase() === uname.toLowerCase())) {
      return { ok: false as const, error: "Username is already taken." };
    }
    const now = new Date().toISOString();
    const newUser: User = {
      id: crypto.randomUUID(),
      username: uname,
      password,
      fullName: name,
      createdAt: now,
      lastActive: now,
      isAdmin: false,
    };
    saveUsers([...users, newUser]);
    setSession(uname);
    setUser(newUser);
    return { ok: true as const };
  }, []);

  const updateProfile = useCallback(
    (fullName: string, username: string) => {
      if (!user) return { ok: false as const, error: "Not signed in." };
      const result = updateUserProfile(user.username, { fullName, username });
      if (!result.ok) return result;
      setUser(result.user);
      return { ok: true as const };
    },
    [user]
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      updateProfile,
      logout,
      refreshUser,
    }),
    [user, loading, login, signup, updateProfile, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
