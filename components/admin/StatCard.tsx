"use client";

import type { ReactNode } from "react";

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  accent: "blue" | "green" | "purple";
}) {
  const accentStyles =
    accent === "blue"
      ? { iconBg: "bg-blue-50", iconText: "text-blue-600", value: "text-blue-600" }
      : accent === "green"
        ? {
            iconBg: "bg-emerald-50",
            iconText: "text-emerald-600",
            value: "text-emerald-600",
          }
        : {
            iconBg: "bg-violet-50",
            iconText: "text-violet-600",
            value: "text-violet-600",
          };

  return (
    <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-semibold text-black/60">{title}</div>
          <div className={`text-3xl font-bold ${accentStyles.value}`}>{value}</div>
          <div className="text-xs text-black/40">{subtitle}</div>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentStyles.iconBg} ${accentStyles.iconText}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

