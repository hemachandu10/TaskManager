"use client";

import React, { useState, useMemo } from "react";
import { useTasks } from "@/context/TaskContext";
import { useModal } from "@/context/ModalContext";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskFiltersState } from "@/lib/supabase/types";
import { filterAndSortTasks } from "@/lib/task-utils";
import { Archive } from "lucide-react";

export default function ArchivedPage() {
  const { tasks, loading } = useTasks();
  const { openEditTask, openDetails } = useModal();

  const [filters, setFilters] = useState<TaskFiltersState>({
    search: "",
    categoryId: "all",
    tagId: "all",
    priority: "all",
    isOverdue: false,
    sortBy: "updated_desc",
  });

  const archivedBaseTasks = useMemo(() => {
    return tasks.filter((t) => !t.deleted_at && Boolean(t.archived_at));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return filterAndSortTasks(archivedBaseTasks, filters);
  }, [archivedBaseTasks, filters]);

  const handleFilterChange = (updates: Partial<TaskFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      categoryId: "all",
      tagId: "all",
      priority: "all",
      isOverdue: false,
      sortBy: "updated_desc",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Archive className="w-5 h-5 text-zinc-400" />
            Archived Tasks
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Archived tasks are hidden from main lists. You can restore them anytime or move them to trash.
          </p>
        </div>
      </div>

      <TaskFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      <TaskList
        tasks={filteredTasks}
        loading={loading}
        onEditTask={openEditTask}
        onOpenDetails={openDetails}
        emptyTitle="Archive is empty"
        emptyDescription="Tasks you archive will appear here."
      />
    </div>
  );
}
