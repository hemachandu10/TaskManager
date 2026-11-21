"use client";

import React from "react";
import { useTasks } from "@/context/TaskContext";
import { StatCard } from "./StatCard";
import { ProgressChart } from "./ProgressChart";
import { QuickAddTask } from "./QuickAddTask";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskWithDetails } from "@/lib/supabase/types";
import {
  CheckCircle2,
  Clock,
  CircleDot,
  Layers,
  ArrowRight,
  History,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface DashboardOverviewProps {
  onOpenTaskModal: () => void;
  onEditTask: (task: TaskWithDetails) => void;
  onOpenDetails: (task: TaskWithDetails) => void;
}

export function DashboardOverview({
  onOpenTaskModal,
  onEditTask,
  onOpenDetails,
}: DashboardOverviewProps) {
  const { tasks, stats, loading } = useTasks();

  // Active tasks only
  const activeTasks = tasks.filter((t) => !t.deleted_at && !t.archived_at);

  // Recently opened tasks (ordered by last_opened_at desc)
  const recentlyOpenedTasks = activeTasks
    .filter((t) => Boolean(t.last_opened_at))
    .sort(
      (a, b) =>
        new Date(b.last_opened_at!).getTime() - new Date(a.last_opened_at!).getTime()
    )
    .slice(0, 3);

  // Recently added or updated active tasks
  const recentlyUpdatedTasks = [...activeTasks]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Add */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Personal Task &amp; Learning Vault
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Save unfinished problems, courses, docs, and return to them anytime.
            </p>
          </div>
          <Button onClick={onOpenTaskModal} size="sm" className="self-start sm:self-auto">
            + New Task
          </Button>
        </div>

        <QuickAddTask />
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Link href="/todo" className="block">
          <StatCard
            title="Total Active"
            value={stats.totalActive}
            icon={Layers}
            colorScheme="zinc"
            subtitle={`${stats.completionRate}% finished`}
          />
        </Link>
        <Link href="/todo" className="block">
          <StatCard
            title="To Do"
            value={stats.todoCount}
            icon={CircleDot}
            colorScheme="indigo"
            subtitle="In progress"
          />
        </Link>
        <Link href="/later" className="block">
          <StatCard
            title="Do Later"
            value={stats.laterCount}
            icon={Clock}
            colorScheme="amber"
            subtitle="Postponed"
          />
        </Link>
        <Link href="/completed" className="block">
          <StatCard
            title="Completed"
            value={stats.completedCount}
            icon={CheckCircle2}
            colorScheme="emerald"
            subtitle="Retained"
          />
        </Link>
      </div>

      {/* Overdue Warning Alert if any active task is overdue */}
      {stats.overdueCount > 0 && (
        <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-rose-800 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>
              You have <strong className="font-semibold">{stats.overdueCount}</strong> overdue{" "}
              {stats.overdueCount === 1 ? "task" : "tasks"} needing attention.
            </span>
          </div>
          <Link
            href="/todo?overdue=true"
            className="font-medium text-rose-700 dark:text-rose-300 hover:underline shrink-0"
          >
            Review Overdue &rarr;
          </Link>
        </div>
      )}

      {/* Progress Chart & Breakdown */}
      {stats.totalActive > 0 && <ProgressChart stats={stats} />}

      {/* Recently Opened Tasks Section */}
      {recentlyOpenedTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              Recently Opened Tasks
            </h2>
          </div>
          <TaskList
            tasks={recentlyOpenedTasks}
            loading={loading}
            onEditTask={onEditTask}
            onOpenDetails={onOpenDetails}
          />
        </div>
      )}

      {/* Recently Added or Updated Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Recently Updated Tasks
          </h2>
          <Link
            href="/todo"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
          >
            View all tasks <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <TaskList
          tasks={recentlyUpdatedTasks}
          loading={loading}
          onEditTask={onEditTask}
          onOpenDetails={onOpenDetails}
          onAddTask={onOpenTaskModal}
          emptyTitle="Your Vault is Empty"
          emptyDescription="Start saving LeetCode problems, tutorials, documentation, and web pages so you can easily return to them later."
        />
      </div>
    </div>
  );
}
