"use client";

import React from "react";
import { TaskWithDetails } from "@/lib/supabase/types";
import { TaskCard } from "./TaskCard";
import { TaskCardSkeleton } from "@/components/ui/Skeleton";
import { Inbox, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TaskListProps {
  tasks: TaskWithDetails[];
  loading?: boolean;
  onEditTask: (task: TaskWithDetails) => void;
  onOpenDetails: (task: TaskWithDetails) => void;
  onAddTask?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  isTrashView?: boolean;
}

export function TaskList({
  tasks,
  loading = false,
  onEditTask,
  onOpenDetails,
  onAddTask,
  emptyTitle = "No tasks found",
  emptyDescription = "No tasks match your current criteria or none have been added yet.",
  isTrashView = false,
}: TaskListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3.5">
          <Inbox className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          {emptyTitle}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
          {emptyDescription}
        </p>
        {onAddTask && !isTrashView && (
          <Button onClick={onAddTask} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add First Task
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEditTask}
          onOpenDetails={onOpenDetails}
          isTrashView={isTrashView}
        />
      ))}
    </div>
  );
}
