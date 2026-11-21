"use client";

import React from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { TaskFiltersState, TaskPriority, TaskStatus } from "@/lib/supabase/types";
import { useTasks } from "@/context/TaskContext";

interface TaskFiltersProps {
  filters: TaskFiltersState;
  onFilterChange: (newFilters: Partial<TaskFiltersState>) => void;
  onResetFilters: () => void;
  hideStatusFilter?: boolean;
}

export function TaskFilters({
  filters,
  onFilterChange,
  onResetFilters,
  hideStatusFilter = false,
}: TaskFiltersProps) {
  const { categories, tags } = useTasks();

  const hasActiveFilters =
    Boolean(filters.search) ||
    (!hideStatusFilter && filters.status && filters.status !== "all") ||
    (filters.categoryId && filters.categoryId !== "all") ||
    (filters.tagId && filters.tagId !== "all") ||
    (filters.priority && filters.priority !== "all") ||
    Boolean(filters.isOverdue);

  return (
    <div className="space-y-3">
      {/* Search Bar & Filter Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search tasks, URLs, notes, categories, tags..."
            className="w-full h-10 pl-9 pr-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: "" })}
              className="absolute right-2.5 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="h-10 pl-8 pr-7 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
            >
              <option value="created_desc">Newest First</option>
              <option value="created_asc">Oldest First</option>
              <option value="updated_desc">Recently Updated</option>
              <option value="title_asc">Alphabetical (A-Z)</option>
              <option value="priority_desc">Highest Priority</option>
              <option value="due_date_asc">Earliest Due Date</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 absolute left-2.5 top-3.5 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filter Pills Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-zinc-400 dark:text-zinc-500 flex items-center gap-1 font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
        </span>

        {/* Status Filter (if not already locked by current page view) */}
        {!hideStatusFilter && (
          <select
            value={filters.status || "all"}
            onChange={(e) =>
              onFilterChange({
                status: e.target.value === "all" ? undefined : (e.target.value as TaskStatus),
              })
            }
            className="h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="later">Do Later</option>
            <option value="completed">Completed</option>
          </select>
        )}

        {/* Priority Filter */}
        <select
          value={filters.priority || "all"}
          onChange={(e) =>
            onFilterChange({
              priority: e.target.value === "all" ? undefined : (e.target.value as TaskPriority),
            })
          }
          className="h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {/* Category Filter */}
        <select
          value={filters.categoryId || "all"}
          onChange={(e) =>
            onFilterChange({
              categoryId: e.target.value === "all" ? undefined : e.target.value,
            })
          }
          className="h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Tag Filter */}
        <select
          value={filters.tagId || "all"}
          onChange={(e) =>
            onFilterChange({
              tagId: e.target.value === "all" ? undefined : e.target.value,
            })
          }
          className="h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer"
        >
          <option value="all">All Tags</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>
              #{t.name}
            </option>
          ))}
        </select>

        {/* Overdue Quick Toggle Pill */}
        <button
          onClick={() => onFilterChange({ isOverdue: !filters.isOverdue })}
          className={`h-8 px-2.5 rounded-md border font-medium transition-colors cursor-pointer flex items-center gap-1 ${
            filters.isOverdue
              ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
              : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          }`}
        >
          Overdue Only
        </button>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="h-8 px-2.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
