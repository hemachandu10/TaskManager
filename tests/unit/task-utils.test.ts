import { describe, it, expect } from "vitest";
import { filterAndSortTasks, calculateTaskStats } from "@/lib/task-utils";
import { TaskWithDetails } from "@/lib/supabase/types";

const mockTasks: TaskWithDetails[] = [
  {
    id: "1",
    user_id: "user-1",
    title: "LeetCode 1: Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    hostname: "leetcode.com",
    favicon_url: null,
    description: "Array problem with hash map",
    notes: "Review one-pass hash table",
    status: "todo",
    priority: "high",
    category_id: "cat-code",
    due_date: new Date(Date.now() - 86400000).toISOString(), // overdue
    last_opened_at: null,
    completed_at: null,
    archived_at: null,
    deleted_at: null,
    created_at: "2026-10-01T10:00:00Z",
    updated_at: "2026-10-01T10:00:00Z",
    category: { id: "cat-code", user_id: "user-1", name: "Coding", color: "#3b82f6", icon: "code", created_at: "" },
    tags: [{ id: "tag-algo", user_id: "user-1", name: "algorithms", created_at: "" }],
  },
  {
    id: "2",
    user_id: "user-1",
    title: "Vercel Next.js Deployment Documentation",
    url: "https://vercel.com/docs",
    hostname: "vercel.com",
    favicon_url: null,
    description: "Deployment steps and environment variables",
    notes: "Configure SSR cookies",
    status: "later",
    priority: "medium",
    category_id: "cat-docs",
    due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    last_opened_at: null,
    completed_at: null,
    archived_at: null,
    deleted_at: null,
    created_at: "2026-10-05T12:00:00Z",
    updated_at: "2026-10-05T12:00:00Z",
    category: { id: "cat-docs", user_id: "user-1", name: "Documentation", color: "#f59e0b", icon: "book", created_at: "" },
    tags: [{ id: "tag-next", user_id: "user-1", name: "nextjs", created_at: "" }],
  },
  {
    id: "3",
    user_id: "user-1",
    title: "TypeScript 5.8 Handbook",
    url: "https://typescriptlang.org",
    hostname: "typescriptlang.org",
    favicon_url: null,
    description: "Language reference",
    notes: "Finished reading generics chapter",
    status: "completed",
    priority: "low",
    category_id: "cat-docs",
    due_date: null,
    last_opened_at: null,
    completed_at: "2026-10-10T14:00:00Z",
    archived_at: null,
    deleted_at: null,
    created_at: "2026-10-08T09:00:00Z",
    updated_at: "2026-10-10T14:00:00Z",
    category: { id: "cat-docs", user_id: "user-1", name: "Documentation", color: "#f59e0b", icon: "book", created_at: "" },
    tags: [],
  },
];

describe("Task Filtering, Sorting, and Stats Calculation", () => {
  describe("filterAndSortTasks", () => {
    it("should filter by search query across title, url, notes, and tags", () => {
      const byTitle = filterAndSortTasks(mockTasks, { search: "two sum" });
      expect(byTitle.length).toBe(1);
      expect(byTitle[0].id).toBe("1");

      const byNotes = filterAndSortTasks(mockTasks, { search: "generics" });
      expect(byNotes.length).toBe(1);
      expect(byNotes[0].id).toBe("3");

      const byTag = filterAndSortTasks(mockTasks, { search: "algorithms" });
      expect(byTag.length).toBe(1);
      expect(byTag[0].id).toBe("1");
    });

    it("should filter by status", () => {
      const todo = filterAndSortTasks(mockTasks, { status: "todo" });
      expect(todo.length).toBe(1);
      expect(todo[0].id).toBe("1");

      const later = filterAndSortTasks(mockTasks, { status: "later" });
      expect(later.length).toBe(1);
      expect(later[0].id).toBe("2");

      const completed = filterAndSortTasks(mockTasks, { status: "completed" });
      expect(completed.length).toBe(1);
      expect(completed[0].id).toBe("3");
    });

    it("should filter overdue tasks (excluding completed)", () => {
      const overdue = filterAndSortTasks(mockTasks, { isOverdue: true });
      expect(overdue.length).toBe(1);
      expect(overdue[0].id).toBe("1");
    });

    it("should sort by priority (high > medium > low)", () => {
      const sorted = filterAndSortTasks(mockTasks, { sortBy: "priority_desc" });
      expect(sorted[0].priority).toBe("high");
      expect(sorted[1].priority).toBe("medium");
      expect(sorted[2].priority).toBe("low");
    });

    it("should sort alphabetically by title", () => {
      const sorted = filterAndSortTasks(mockTasks, { sortBy: "title_asc" });
      expect(sorted[0].title).toBe("LeetCode 1: Two Sum");
      expect(sorted[1].title).toBe("TypeScript 5.8 Handbook");
      expect(sorted[2].title).toBe("Vercel Next.js Deployment Documentation");
    });
  });

  describe("calculateTaskStats", () => {
    it("should calculate active counts and completion rate accurately", () => {
      const stats = calculateTaskStats(mockTasks);
      expect(stats.totalActive).toBe(3);
      expect(stats.todoCount).toBe(1);
      expect(stats.laterCount).toBe(1);
      expect(stats.completedCount).toBe(1);
      expect(stats.overdueCount).toBe(1);
      expect(stats.completionRate).toBe(33); // 1 out of 3 = 33%
    });

    it("should not count archived or deleted tasks as active", () => {
      const mixedTasks: TaskWithDetails[] = [
        ...mockTasks,
        {
          ...mockTasks[0],
          id: "4",
          archived_at: "2026-10-15T00:00:00Z",
        },
        {
          ...mockTasks[0],
          id: "5",
          deleted_at: "2026-10-16T00:00:00Z",
        },
      ];

      const stats = calculateTaskStats(mixedTasks);
      expect(stats.totalActive).toBe(3);
      expect(stats.archivedCount).toBe(1);
      expect(stats.deletedCount).toBe(1);
    });
  });
});
