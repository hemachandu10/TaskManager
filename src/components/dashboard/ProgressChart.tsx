"use client";

import React from "react";
import { calculateTaskStats } from "@/lib/task-utils";

interface ProgressChartProps {
  stats: ReturnType<typeof calculateTaskStats>;
}

export function ProgressChart({ stats }: ProgressChartProps) {
  const { totalActive, todoCount, laterCount, completedCount, completionRate } = stats;

  const todoPercent = totalActive > 0 ? (todoCount / totalActive) * 100 : 0;
  const laterPercent = totalActive > 0 ? (laterCount / totalActive) * 100 : 0;
  const completedPercent = totalActive > 0 ? (completedCount / totalActive) * 100 : 0;

  return (
    <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Task Progress &amp; Balance
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {completedCount} of {totalActive} active tasks completed
          </p>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {completionRate}%
          </span>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
            Finished
          </p>
        </div>
      </div>

      {/* Visual Multi-Segment Bar */}
      <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
        <div
          style={{ width: `${completedPercent}%` }}
          className="h-full bg-emerald-500 transition-all duration-300"
          title={`Completed: ${completedCount} (${Math.round(completedPercent)}%)`}
        />
        <div
          style={{ width: `${todoPercent}%` }}
          className="h-full bg-indigo-500 transition-all duration-300"
          title={`To Do: ${todoCount} (${Math.round(todoPercent)}%)`}
        />
        <div
          style={{ width: `${laterPercent}%` }}
          className="h-full bg-amber-500 transition-all duration-300"
          title={`Do Later: ${laterCount} (${Math.round(laterPercent)}%)`}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Completed: {completedCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
          <span>To Do: {todoCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span>Do Later: {laterCount}</span>
        </div>
      </div>
    </div>
  );
}
