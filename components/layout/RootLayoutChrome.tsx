"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import styles from "./RootLayoutChrome.module.css";

export function RootLayoutChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isAuthLanding = pathname === "/";
  const showNav = !isAuthLanding && !loading && !!user;

  return (
    <div className={styles.outer}>
      <div className={showNav ? styles.withNav : styles.content}>{children}</div>
      {showNav ? <BottomNav /> : null}
    </div>
  );
}
