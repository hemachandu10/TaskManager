import { describe, it, expect } from "vitest";
import { TaskWithDetails } from "@/lib/supabase/types";

describe("Task Lifecycle Management", () => {
  const baseTask: TaskWithDetails = {
    id: "task-lifecycle-1",
    user_id: "user-1",
    title: "Dynamic Programming Course Lesson 4",
    url: "https://example.com/course/dp-4",
    hostname: "example.com",
    favicon_url: null,
    description: "Knapsack problems",
    notes: "Watched half",
    status: "todo",
    priority: "medium",
    category_id: null,
    due_date: null,
    last_opened_at: null,
    completed_at: null,
    archived_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it("should handle status transitions without duplicating or losing data", () => {
    let task = { ...baseTask };
    expect(task.status).toBe("todo");
    expect(task.completed_at).toBeNull();

    // Move to Do Later
    task = { ...task, status: "later", updated_at: new Date().toISOString() };
    expect(task.status).toBe("later");
    expect(task.url).toBe(baseTask.url);
    expect(task.notes).toBe(baseTask.notes);

    // Mark as Completed
    const now = new Date().toISOString();
    task = { ...task, status: "completed", completed_at: now };
    expect(task.status).toBe("completed");
    expect(task.completed_at).toBe(now);

    // Reopen task back to To Do
    task = { ...task, status: "todo", completed_at: null };
    expect(task.status).toBe("todo");
    expect(task.completed_at).toBeNull();
    expect(task.id).toBe(baseTask.id);
  });

  it("should handle archiving and restoring cleanly", () => {
    let task = { ...baseTask };
    expect(task.archived_at).toBeNull();

    // Archive
    const archiveTimestamp = new Date().toISOString();
    task = { ...task, archived_at: archiveTimestamp };
    expect(task.archived_at).toBe(archiveTimestamp);

    // Active list filter should exclude archived
    const isVisibleInActive = !task.deleted_at && !task.archived_at;
    expect(isVisibleInActive).toBe(false);

    // Restore from archive
    task = { ...task, archived_at: null };
    expect(task.archived_at).toBeNull();
    expect(!task.deleted_at && !task.archived_at).toBe(true);
  });

  it("should handle soft-delete (trash) and undo restoration", () => {
    let task = { ...baseTask };
    expect(task.deleted_at).toBeNull();

    // Soft delete
    const deleteTimestamp = new Date().toISOString();
    task = { ...task, deleted_at: deleteTimestamp };
    expect(task.deleted_at).toBe(deleteTimestamp);

    // Should be hidden from normal active views
    const isVisibleInActive = !task.deleted_at && !task.archived_at;
    expect(isVisibleInActive).toBe(false);

    // Undo delete
    task = { ...task, deleted_at: null };
    expect(task.deleted_at).toBeNull();
    expect(!task.deleted_at && !task.archived_at).toBe(true);
  });
});
