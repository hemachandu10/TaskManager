import { TaskWithDetails, TaskPriority, TaskFiltersState } from "./supabase/types";
import { isOverdue } from "./utils";

export const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function filterAndSortTasks(
  tasks: TaskWithDetails[],
  filters: Partial<TaskFiltersState>
): TaskWithDetails[] {
  let result = [...tasks];

  // Search filter
  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(q);
      const urlMatch = task.url?.toLowerCase().includes(q) ?? false;
      const descMatch = task.description?.toLowerCase().includes(q) ?? false;
      const notesMatch = task.notes?.toLowerCase().includes(q) ?? false;
      const catMatch = task.category?.name.toLowerCase().includes(q) ?? false;
      const tagsMatch = task.tags?.some((t) => t.name.toLowerCase().includes(q)) ?? false;
      return titleMatch || urlMatch || descMatch || notesMatch || catMatch || tagsMatch;
    });
  }

  // Status filter
  if (filters.status && filters.status !== "all") {
    result = result.filter((task) => task.status === filters.status);
  }

  // Category filter
  if (filters.categoryId && filters.categoryId !== "all") {
    result = result.filter((task) => task.category_id === filters.categoryId);
  }

  // Tag filter
  if (filters.tagId && filters.tagId !== "all") {
    result = result.filter((task) => task.tags?.some((t) => t.id === filters.tagId));
  }

  // Priority filter
  if (filters.priority && filters.priority !== "all") {
    result = result.filter((task) => task.priority === filters.priority);
  }

  // Overdue filter
  if (filters.isOverdue) {
    result = result.filter(
      (task) => task.status !== "completed" && isOverdue(task.due_date)
    );
  }

  // Sorting
  const sortBy = filters.sortBy || "created_desc";
  result.sort((a, b) => {
    switch (sortBy) {
      case "created_desc":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "created_asc":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "updated_desc":
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "priority_desc":
        return PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
      case "due_date_asc": {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      default:
        return 0;
    }
  });

  return result;
}

export function validateTaskInput(input: {
  title: string;
  url?: string | null;
  priority?: string;
  status?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!input.title || !input.title.trim()) {
    errors.title = "Task title is required";
  } else if (input.title.trim().length > 300) {
    errors.title = "Title cannot exceed 300 characters";
  }

  if (input.url && input.url.trim()) {
    const rawUrl = input.url.trim();
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        errors.url = "Only HTTP and HTTPS URLs are permitted";
      }
    } catch {
      errors.url = "Please enter a valid URL (e.g. https://leetcode.com/...)";
    }
  }

  if (input.priority && !["low", "medium", "high"].includes(input.priority)) {
    errors.priority = "Priority must be low, medium, or high";
  }

  if (input.status && !["todo", "later", "completed"].includes(input.status)) {
    errors.status = "Status must be todo, later, or completed";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateTaskStats(tasks: TaskWithDetails[]) {
  // Active tasks = not deleted, not archived
  const activeTasks = tasks.filter((t) => !t.deleted_at && !t.archived_at);
  const todoTasks = activeTasks.filter((t) => t.status === "todo");
  const laterTasks = activeTasks.filter((t) => t.status === "later");
  const completedTasks = activeTasks.filter((t) => t.status === "completed");
  const overdueTasks = activeTasks.filter(
    (t) => t.status !== "completed" && isOverdue(t.due_date)
  );

  const archivedTasks = tasks.filter((t) => !t.deleted_at && Boolean(t.archived_at));
  const deletedTasks = tasks.filter((t) => Boolean(t.deleted_at));

  const totalActive = activeTasks.length;
  const completionRate =
    totalActive > 0 ? Math.round((completedTasks.length / totalActive) * 100) : 0;

  return {
    totalActive,
    todoCount: todoTasks.length,
    laterCount: laterTasks.length,
    completedCount: completedTasks.length,
    overdueCount: overdueTasks.length,
    archivedCount: archivedTasks.length,
    deletedCount: deletedTasks.length,
    completionRate,
  };
}
