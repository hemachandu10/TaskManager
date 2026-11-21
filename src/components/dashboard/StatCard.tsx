import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  subtitle?: string;
  colorScheme?: "indigo" | "amber" | "emerald" | "rose" | "zinc";
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  colorScheme = "zinc",
  onClick,
}: StatCardProps) {
  const schemes = {
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "hover:border-indigo-300 dark:hover:border-indigo-800",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-600 dark:text-amber-400",
      border: "hover:border-amber-300 dark:hover:border-amber-800",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "hover:border-emerald-300 dark:hover:border-emerald-800",
    },
    rose: {
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-600 dark:text-rose-400",
      border: "hover:border-rose-300 dark:hover:border-rose-800",
    },
    zinc: {
      bg: "bg-zinc-100 dark:bg-zinc-800",
      text: "text-zinc-600 dark:text-zinc-300",
      border: "hover:border-zinc-300 dark:hover:border-zinc-700",
    },
  };

  const scheme = schemes[colorScheme];

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-xs transition-all duration-150 flex flex-col justify-between gap-3",
        onClick && "cursor-pointer hover:shadow-md",
        scheme.border
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        <div className={cn("p-2 rounded-lg", scheme.bg, scheme.text)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {value}
        </span>
        {subtitle && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
