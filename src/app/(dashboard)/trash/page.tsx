"use client";

import React, { useState, useMemo } from "react";
import { useTasks } from "@/context/TaskContext";
import { useModal } from "@/context/ModalContext";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskFiltersState } from "@/lib/supabase/types";
import { filterAndSortTasks } from "@/lib/task-utils";
import { Trash2 } from "lucide-react";

export default function TrashPage() {
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

  const trashBaseTasks = useMemo(() => {
    return tasks.filter((t) => Boolean(t.deleted_at));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return filterAndSortTasks(trashBaseTasks, filters);
  }, [trashBaseTasks, filters]);

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
            <Trash2 className="w-5 h-5 text-rose-500" />
            Trash
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Soft-deleted tasks are held here. You can restore them back to your vault or permanently delete them.
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
        isTrashView={true}
        emptyTitle="Trash is empty"
        emptyDescription="Deleted tasks will appear here for safe restoration or permanent removal."
      />
    </div>
  );
}
