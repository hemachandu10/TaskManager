"use client";

import React, { useState, useMemo } from "react";
import { useTasks } from "@/context/TaskContext";
import { useModal } from "@/context/ModalContext";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskFiltersState } from "@/lib/supabase/types";
import { filterAndSortTasks } from "@/lib/task-utils";
import { CheckCircle2 } from "lucide-react";

export default function CompletedPage() {
  const { tasks, loading } = useTasks();
  const { openEditTask, openDetails } = useModal();

  const [filters, setFilters] = useState<TaskFiltersState>({
    search: "",
    status: "completed",
    categoryId: "all",
    tagId: "all",
    priority: "all",
    isOverdue: false,
    sortBy: "updated_desc",
  });

  const completedBaseTasks = useMemo(() => {
    return tasks.filter(
      (t) => !t.deleted_at && !t.archived_at && t.status === "completed"
    );
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return filterAndSortTasks(completedBaseTasks, filters);
  }, [completedBaseTasks, filters]);

  const handleFilterChange = (updates: Partial<TaskFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "completed",
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
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Completed Tasks
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Finished tasks are safely preserved here indefinitely until you explicitly archive or delete them.
          </p>
        </div>
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
        emptyTitle="No completed tasks yet"
        emptyDescription="Tasks you complete will be retained here for permanent reference and review."
      />
    </div>
  );
}
