"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTasks } from "@/context/TaskContext";
import { useModal } from "@/context/ModalContext";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskFiltersState } from "@/lib/supabase/types";
import { filterAndSortTasks } from "@/lib/task-utils";
import { Button } from "@/components/ui/Button";
import { Plus, CircleDot } from "lucide-react";

function TodoContent() {
  const searchParams = useSearchParams();
  const initialOverdue = searchParams.get("overdue") === "true";

  const { tasks, loading } = useTasks();
  const { openCreateTask, openEditTask, openDetails } = useModal();

  const [filters, setFilters] = useState<TaskFiltersState>({
    search: "",
    status: "todo",
    categoryId: "all",
    tagId: "all",
    priority: "all",
    isOverdue: initialOverdue,
    sortBy: "created_desc",
  });

  // Base list: active (not archived, not deleted) with status === 'todo'
  const todoBaseTasks = useMemo(() => {
    return tasks.filter(
      (t) => !t.deleted_at && !t.archived_at && t.status === "todo"
    );
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return filterAndSortTasks(todoBaseTasks, filters);
  }, [todoBaseTasks, filters]);

  const handleFilterChange = (updates: Partial<TaskFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "todo",
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
            <CircleDot className="w-5 h-5 text-indigo-500" />
            To Do
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Tasks, exercises, and documentation you are currently working on.
          </p>
        </div>

        <Button onClick={() => openCreateTask("todo")} size="sm" className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Add To Do Task
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
        onAddTask={() => openCreateTask("todo")}
        emptyTitle="No To Do tasks found"
        emptyDescription="You have no pending tasks in To Do. Add a task or adjust your search filters."
      />
    </div>
  );
}

export default function TodoPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl" />}>
      <TodoContent />
    </Suspense>
  );
}
