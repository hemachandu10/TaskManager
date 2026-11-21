"use client";

import React, { useState, useMemo } from "react";
import { useTasks } from "@/context/TaskContext";
import { useModal } from "@/context/ModalContext";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskFiltersState } from "@/lib/supabase/types";
import { filterAndSortTasks } from "@/lib/task-utils";
import { Button } from "@/components/ui/Button";
import { Plus, Clock } from "lucide-react";

export default function DoLaterPage() {
  const { tasks, loading } = useTasks();
  const { openCreateTask, openEditTask, openDetails } = useModal();

  const [filters, setFilters] = useState<TaskFiltersState>({
    search: "",
    status: "later",
    categoryId: "all",
    tagId: "all",
    priority: "all",
    isOverdue: false,
    sortBy: "created_desc",
  });

  const laterBaseTasks = useMemo(() => {
    return tasks.filter(
      (t) => !t.deleted_at && !t.archived_at && t.status === "later"
    );
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return filterAndSortTasks(laterBaseTasks, filters);
  }, [laterBaseTasks, filters]);

  const handleFilterChange = (updates: Partial<TaskFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "later",
      categoryId: "all",
      tagId: "all",
      priority: "all",
      isOverdue: false,
      sortBy: "created_desc",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Do Later
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Deliberately postponed articles, problems, and lessons to revisit when ready.
          </p>
        </div>

        <Button onClick={() => openCreateTask("later")} size="sm" className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Add to Do Later
        </Button>
      </div>

      <TaskFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        hideStatusFilter={true}
      />

      <TaskList
        tasks={filteredTasks}
        loading={loading}
        onEditTask={openEditTask}
        onOpenDetails={openDetails}
        onAddTask={() => openCreateTask("later")}
        emptyTitle="No postponed tasks"
        emptyDescription="You haven't postponed any tasks to Do Later yet."
      />
    </div>
  );
}
