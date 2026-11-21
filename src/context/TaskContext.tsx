"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { TaskWithDetails, Category, Tag, TaskStatus, TaskPriority } from "@/lib/supabase/types";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { calculateTaskStats } from "@/lib/task-utils";

interface CreateTaskPayload {
  title: string;
  url?: string;
  hostname?: string;
  favicon_url?: string;
  description?: string;
  notes?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category_id?: string;
  due_date?: string;
  tag_ids?: string[];
}

interface UpdateTaskPayload {
  title?: string;
  url?: string;
  hostname?: string;
  favicon_url?: string;
  description?: string;
  notes?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category_id?: string | null;
  due_date?: string | null;
  tag_ids?: string[];
  archived_at?: string | null;
  deleted_at?: string | null;
}

interface TaskContextType {
  tasks: TaskWithDetails[];
  categories: Category[];
  tags: Tag[];
  loading: boolean;
  stats: ReturnType<typeof calculateTaskStats>;
  createTask: (payload: CreateTaskPayload) => Promise<{ success: boolean; task?: TaskWithDetails; error?: string }>;
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<{ success: boolean; task?: TaskWithDetails; error?: string }>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  archiveTask: (id: string) => Promise<void>;
  restoreTask: (id: string) => Promise<void>;
  softDeleteTask: (id: string) => Promise<void>;
  undoDeleteTask: (id: string) => Promise<void>;
  permanentlyDeleteTask: (id: string) => Promise<void>;
  recordTaskOpened: (id: string, url: string) => Promise<void>;
  fetchMetadata: (url: string) => Promise<{ title: string | null; description: string | null; hostname: string; faviconUrl: string | null; warning?: string }>;
  createCategory: (name: string, color?: string, icon?: string) => Promise<Category | null>;
  createTag: (name: string) => Promise<Tag | null>;
  refreshTasks: () => Promise<void>;
  resetDemoData: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Initial demo tasks shown ONLY when Supabase credentials have not been configured yet
const DEMO_CATEGORIES: Category[] = [
  { id: "cat-1", user_id: "demo", name: "Coding", color: "#3b82f6", icon: "code", created_at: new Date().toISOString() },
  { id: "cat-2", user_id: "demo", name: "Courses", color: "#8b5cf6", icon: "graduation-cap", created_at: new Date().toISOString() },
  { id: "cat-3", user_id: "demo", name: "Tutorials", color: "#10b981", icon: "video", created_at: new Date().toISOString() },
  { id: "cat-4", user_id: "demo", name: "Documentation", color: "#f59e0b", icon: "book-open", created_at: new Date().toISOString() },
  { id: "cat-5", user_id: "demo", name: "Reading", color: "#06b6d4", icon: "newspaper", created_at: new Date().toISOString() },
];

const DEMO_TAGS: Tag[] = [
  { id: "tag-1", user_id: "demo", name: "algorithms", created_at: new Date().toISOString() },
  { id: "tag-2", user_id: "demo", name: "react", created_at: new Date().toISOString() },
  { id: "tag-3", user_id: "demo", name: "system-design", created_at: new Date().toISOString() },
  { id: "tag-4", user_id: "demo", name: "nextjs", created_at: new Date().toISOString() },
];

const DEMO_TASKS: TaskWithDetails[] = [
  {
    id: "demo-task-1",
    user_id: "demo",
    title: "LeetCode 42: Trapping Rain Water",
    url: "https://leetcode.com/problems/trapping-rain-water/",
    hostname: "leetcode.com",
    favicon_url: "https://leetcode.com/favicon.ico",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap.",
    notes: "Solved with two pointers in O(n) time, need to review monotonic stack variant.",
    status: "todo",
    priority: "high",
    category_id: "cat-1",
    due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    last_opened_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    completed_at: null,
    archived_at: null,
    deleted_at: null,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    category: DEMO_CATEGORIES[0],
    tags: [DEMO_TAGS[0]],
  },
  {
    id: "demo-task-2",
    user_id: "demo",
    title: "Next.js App Router Caching Architecture Guide",
    url: "https://nextjs.org/docs/app/building-your-application/caching",
    hostname: "nextjs.org",
    favicon_url: "https://nextjs.org/favicon.ico",
    description: "In-depth overview of Next.js App Router Request Memoization, Data Cache, Full Route Cache, and Router Cache.",
    notes: "Review revalidateTag and server actions cache invalidation for production deployment.",
    status: "later",
    priority: "medium",
    category_id: "cat-4",
    due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    last_opened_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: null,
    archived_at: null,
    deleted_at: null,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    category: DEMO_CATEGORIES[3],
    tags: [DEMO_TAGS[1], DEMO_TAGS[3]],
  },
  {
    id: "demo-task-3",
    user_id: "demo",
    title: "Distributed Systems: Consensus with Raft",
    url: "https://raft.github.io/",
    hostname: "raft.github.io",
    favicon_url: "https://raft.github.io/favicon.ico",
    description: "Understandable Consensus Algorithm visualization and paper.",
    notes: "Watched interactive visualization. Next step: implement leader election in Go.",
    status: "completed",
    priority: "high",
    category_id: "cat-2",
    due_date: null,
    last_opened_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    completed_at: new Date(Date.now() - 86400000).toISOString(),
    archived_at: null,
    deleted_at: null,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    category: DEMO_CATEGORIES[1],
    tags: [DEMO_TAGS[2]],
  },
];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user, isConfigured } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTasks = useCallback(async () => {
    if (!isConfigured) {
      if (typeof window !== "undefined") {
        try {
          const savedTasks = localStorage.getItem("taskvault_local_tasks");
          const savedCats = localStorage.getItem("taskvault_local_categories");
          const savedTags = localStorage.getItem("taskvault_local_tags");
          setTasks(savedTasks ? JSON.parse(savedTasks) : DEMO_TASKS);
          setCategories(savedCats ? JSON.parse(savedCats) : DEMO_CATEGORIES);
          setTags(savedTags ? JSON.parse(savedTags) : DEMO_TAGS);
        } catch {
          setTasks(DEMO_TASKS);
          setCategories(DEMO_CATEGORIES);
          setTags(DEMO_TAGS);
        }
      } else {
        setTasks(DEMO_TASKS);
        setCategories(DEMO_CATEGORIES);
        setTags(DEMO_TAGS);
      }
      setLoading(false);
      return;
    }

    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch tasks, categories, and tags concurrently
      const [tasksRes, categoriesRes, tagsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/categories"),
        fetch("/api/tags"),
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTags(tagsData.tags || []);
      }
    } catch (err) {
      console.error("Failed to load tasks data:", err);
      toast.error("Failed to synchronize tasks from server");
    } finally {
      setLoading(false);
    }
  }, [isConfigured, user, toast]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  // Persist preview mode state to local storage
  useEffect(() => {
    if (!isConfigured && !loading && typeof window !== "undefined") {
      try {
        localStorage.setItem("taskvault_local_tasks", JSON.stringify(tasks));
        localStorage.setItem("taskvault_local_categories", JSON.stringify(categories));
        localStorage.setItem("taskvault_local_tags", JSON.stringify(tags));
      } catch {
        // ignore storage errors
      }
    }
  }, [tasks, categories, tags, isConfigured, loading]);

  const resetDemoData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("taskvault_local_tasks");
      localStorage.removeItem("taskvault_local_categories");
      localStorage.removeItem("taskvault_local_tags");
    }
    setTasks(DEMO_TASKS);
    setCategories(DEMO_CATEGORIES);
    setTags(DEMO_TAGS);
    toast.success("Vault demo data reset to default");
  };

  const stats = useMemo(() => calculateTaskStats(tasks), [tasks]);

  const fetchMetadata = async (url: string) => {
    try {
      const res = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch metadata");
      }
      return await res.json();
    } catch (err: any) {
      return {
        title: null,
        description: null,
        hostname: "",
        faviconUrl: null,
        warning: err.message,
      };
    }
  };

  const createTask = async (payload: CreateTaskPayload) => {
    if (!isConfigured) {
      const newTask: TaskWithDetails = {
        id: `local-${Date.now()}`,
        user_id: "demo",
        title: payload.title,
        url: payload.url || null,
        hostname: payload.hostname || null,
        favicon_url: payload.favicon_url || null,
        description: payload.description || null,
        notes: payload.notes || null,
        status: payload.status || "todo",
        priority: payload.priority || "medium",
        category_id: payload.category_id || null,
        due_date: payload.due_date || null,
        last_opened_at: null,
        completed_at: payload.status === "completed" ? new Date().toISOString() : null,
        archived_at: null,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: categories.find((c) => c.id === payload.category_id) || null,
        tags: tags.filter((t) => payload.tag_ids?.includes(t.id)),
      };
      setTasks((prev) => [newTask, ...prev]);
      toast.success("Task created");
      return { success: true, task: newTask };
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.errors?.title || data.error || "Failed to create task";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      setTasks((prev) => [data.task, ...prev]);
      toast.success("Task created");
      return { success: true, task: data.task };
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
      return { success: false, error: err.message };
    }
  };

  const updateTask = async (id: string, payload: UpdateTaskPayload) => {
    if (!isConfigured) {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const updated = {
              ...t,
              ...payload,
              updated_at: new Date().toISOString(),
              category: payload.category_id !== undefined
                ? categories.find((c) => c.id === payload.category_id) || null
                : t.category,
              tags: payload.tag_ids !== undefined
                ? tags.filter((tag) => payload.tag_ids?.includes(tag.id))
                : t.tags,
            };
            return updated;
          }
          return t;
        })
      );
      toast.success("Task updated");
      return { success: true };
    }

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update task");
        return { success: false, error: data.error };
      }

      setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
      toast.success("Task updated");
      return { success: true, task: data.task };
    } catch (err: any) {
      toast.error(err.message || "Failed to update task");
      return { success: false, error: err.message };
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  };

  const archiveTask = async (id: string) => {
    await updateTask(id, { archived_at: new Date().toISOString() });
    toast.info("Task moved to archive");
  };

  const restoreTask = async (id: string) => {
    await updateTask(id, { archived_at: null, deleted_at: null });
    toast.success("Task restored to active list");
  };

  const undoDeleteTask = async (id: string) => {
    await updateTask(id, { deleted_at: null });
    toast.success("Task restored");
  };

  const softDeleteTask = async (id: string) => {
    const targetTask = tasks.find((t) => t.id === id);
    if (!targetTask) return;

    await updateTask(id, { deleted_at: new Date().toISOString() });

    // Show undo toast notification
    toast.info("Task moved to trash", {
      label: "Undo",
      onClick: () => {
        undoDeleteTask(id);
      },
    });
  };

  const permanentlyDeleteTask = async (id: string) => {
    if (!isConfigured) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task permanently deleted");
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete task");
        return;
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task permanently deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task");
    }
  };

  const recordTaskOpened = async (id: string, url: string) => {
    // Open destination in new tab with security attributes
    window.open(url, "_blank", "noopener,noreferrer");

    // Optimistically update last_opened_at in local state
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, last_opened_at: now } : t))
    );

    if (isConfigured) {
      try {
        await fetch(`/api/tasks/${id}/open`, { method: "POST" });
      } catch (_err) {
        // Silently catch background open tracking error
      }
    }
  };

  const createCategory = async (name: string, color = "#6366f1", icon = "folder") => {
    if (!isConfigured) {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        user_id: "demo",
        name,
        color,
        icon,
        created_at: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCat]);
      return newCat;
    }

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, icon }),
      });
      const data = await res.json();
      if (res.ok && data.category) {
        setCategories((prev) => [...prev, data.category]);
        return data.category;
      }
      return null;
    } catch {
      return null;
    }
  };

  const createTag = async (name: string) => {
    if (!isConfigured) {
      const newTag: Tag = {
        id: `tag-${Date.now()}`,
        user_id: "demo",
        name: name.toLowerCase().replace(/^#/, ""),
        created_at: new Date().toISOString(),
      };
      setTags((prev) => [...prev, newTag]);
      return newTag;
    }

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok && data.tag) {
        if (!tags.some((t) => t.id === data.tag.id)) {
          setTags((prev) => [...prev, data.tag]);
        }
        return data.tag;
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        tags,
        loading,
        stats,
        createTask,
        updateTask,
        updateTaskStatus,
        archiveTask,
        restoreTask,
        softDeleteTask,
        undoDeleteTask,
        permanentlyDeleteTask,
        recordTaskOpened,
        fetchMetadata,
        createCategory,
        createTag,
        refreshTasks,
        resetDemoData,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
