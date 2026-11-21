import React from "react";
import { cn } from "@/lib/utils";
import { TaskPriority, TaskStatus } from "@/lib/supabase/types";
import { AlertCircle, Clock, CheckCircle2, CircleDot } from "lucide-react";

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const configs = {
    high: {
      label: "High",
      className: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
      dot: "bg-rose-500",
    },
    medium: {
      label: "Medium",
      className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
      dot: "bg-amber-500",
    },
    low: {
      label: "Low",
      className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/60",
      dot: "bg-zinc-400",
    },
  };

  const config = configs[priority] || configs.medium;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border",
        config.className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const configs = {
    todo: {
      label: "To Do",
      icon: CircleDot,
      className: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50",
    },
    later: {
      label: "Do Later",
      icon: Clock,
      className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    },
  };

  const config = configs[status] || configs.todo;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border",
        config.className
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {config.label}
    </span>
  );
}

export function OverdueBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
      <AlertCircle className="w-3 h-3 shrink-0" />
      Overdue
    </span>
  );
}

export function CategoryBadge({
  name,
  color = "#6366f1",
}: {
  name: string;
  color?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}

export function TagBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/40">
      #{name}
    </span>
  );
}
