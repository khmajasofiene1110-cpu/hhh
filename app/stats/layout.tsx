import { AppShell } from "@/components/layout/AppShell";
import type { ReactNode } from "react";

export default function StatsLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
