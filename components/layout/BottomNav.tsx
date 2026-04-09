"use client";

import { BarChart2, Home, Target, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.css";

const items = [
  { href: "/dashboard", label: "Dashboard", Icon: Home },
  { href: "/stats", label: "Stats", Icon: BarChart2 },
  { href: "/budgets", label: "Budgets", Icon: Wallet },
  { href: "/goals", label: "Goals", Icon: Target },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Main">
      {items.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.link} ${active ? styles.linkActive : ""}`}
            prefetch
          >
            <span className={styles.iconSlot}>
              <Icon
                className={`${styles.icon} ${active ? styles.iconActive : ""}`}
                aria-hidden
              />
              {active ? <span className={styles.dot} aria-hidden /> : null}
            </span>
            <span className={styles.linkLabel}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
