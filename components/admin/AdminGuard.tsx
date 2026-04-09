"use client";

import { useAuth } from "@/hooks/useAuth";
import { isMasterAdminUsername } from "@/lib/admin-access";
import { isAdminSessionActive } from "@/lib/admin-session";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const authorized =
    isAdminSessionActive() ||
    (!!user && isMasterAdminUsername(user.username) && user.password === "admin123");

  useEffect(() => {
    if (loading) return;
    if (!authorized) {
      router.replace("/admin/login");
    }
  }, [authorized, loading, router]);

  if (loading || !authorized) {
    return null;
  }

  return <>{children}</>;
}
