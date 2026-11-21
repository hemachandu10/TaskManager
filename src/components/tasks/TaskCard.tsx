"use client";

import React, { useState } from "react";
import { TaskWithDetails } from "@/lib/supabase/types";
import { useTasks } from "@/context/TaskContext";
import { PriorityBadge, StatusBadge, CategoryBadge, TagBadge, OverdueBadge } from "@/components/ui/Badge";
import { formatRelativeTime, formatDate, isOverdue, cn } from "@/lib/utils";
import {
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  Clock,
  CircleDot,
  Archive,
  RotateCcw,
  Trash2,
  Edit2,
  Globe,
  Calendar,
  Check,
} from "lucide-react";

interface TaskCardProps {
  task: TaskWithDetails;
  onEdit: (task: TaskWithDetails) => void;
  onOpenDetails: (task: TaskWithDetails) => void;
  isTrashView?: boolean;
}

export function TaskCard({ task, onEdit, onOpenDetails, isTrashView = false }: TaskCardProps) {
  const {
    updateTaskStatus,
    archiveTask,
    restoreTask,
    softDeleteTask,
    undoDeleteTask,
    permanentlyDeleteTask,
    recordTaskOpened,
  } = useTasks();

  const [menuOpen, setMenuOpen] = useState(false);

  const hasDueDate = Boolean(task.due_date);
  const taskIsOverdue = hasDueDate && isOverdue(task.due_date) && task.status !== "completed";
  const isArchived = Boolean(task.archived_at);
  const isDeleted = Boolean(task.deleted_at) || isTrashView;

  const handleOpenUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.url) return;
    recordTaskOpened(task.id, task.url);
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = task.status === "completed" ? "todo" : "completed";
    updateTaskStatus(task.id, nextStatus);
  };

  return (
    <div
      onClick={() => onOpenDetails(task)}
      className="group relative p-4 rounded-xl border transition-all duration-150 cursor-pointer bg-white dark:bg-zinc-900/70 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md flex flex-col justify-between gap-3"
    >
      {/* Top Header: Hostname/Source & Quick Menu */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {task.favicon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={task.favicon_url}
              alt=""
              className="w-4 h-4 rounded-xs shrink-0 object-contain"
              onError={(e) => {
                // If favicon image fails to load, fallback to Globe icon
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          )}

          {task.hostname ? (
            <span className="font-medium text-zinc-500 dark:text-zinc-400 truncate">
              {task.hostname}
            </span>
          ) : (
            <span className="font-medium text-zinc-400 dark:text-zinc-500">Personal Task</span>
          )}

          {task.last_opened_at && (
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
              • opened {formatRelativeTime(task.last_opened_at)}
            </span>
          )}
        </div>

        {/* Menu Dropdown */}
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Task options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-7 z-30 w-44 py-1 rounded-lg border shadow-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs animate-in fade-in zoom-in-95 duration-100">
                {task.url && (
                  <button
                    onClick={(e) => {
                      handleOpenUrl(e);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    Open Original Page
                  </button>
                )}

                {!isDeleted && (
                  <button
                    onClick={() => {
                      onEdit(task);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                    Edit Details
                  </button>
                )}

                <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                {/* Status transitions */}
                {!isDeleted && !isArchived && (
                  <>
                    {task.status !== "todo" && (
                      <button
                        onClick={() => {
                          updateTaskStatus(task.id, "todo");
                          setMenuOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <CircleDot className="w-3.5 h-3.5 text-indigo-400" />
                        Move to To Do
                      </button>
                    )}
                    {task.status !== "later" && (
                      <button
                        onClick={() => {
                          updateTaskStatus(task.id, "later");
                          setMenuOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Move to Do Later
                      </button>
                    )}
                    {task.status !== "completed" && (
                      <button
                        onClick={() => {
                          updateTaskStatus(task.id, "completed");
                          setMenuOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Mark Completed
                      </button>
                    )}
                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                  </>
                )}

                {/* Archive / Restore */}
                {isArchived ? (
                  <button
                    onClick={() => {
                      restoreTask(task.id);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                    Restore from Archive
                  </button>
                ) : !isDeleted ? (
                  <button
                    onClick={() => {
                      archiveTask(task.id);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Archive className="w-3.5 h-3.5 text-zinc-400" />
                    Archive Task
                  </button>
                ) : null}

                {/* Soft Delete or Restore from Trash */}
                {isDeleted ? (
                  <>
                    <button
                      onClick={() => {
                        undoDeleteTask(task.id);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore Task
                    </button>
                    <button
                      onClick={() => {
                        permanentlyDeleteTask(task.id);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Permanently
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      softDeleteTask(task.id);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Move to Trash
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Task Body */}
      <div className="space-y-1.5">
        <div className="flex items-start gap-2.5">
          {!isDeleted && !isArchived && (
            <button
              onClick={handleToggleComplete}
              className={cn(
                "mt-0.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer",
                task.status === "completed"
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-zinc-300 dark:border-zinc-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-transparent hover:text-emerald-500"
              )}
              title={task.status === "completed" ? "Mark as incomplete" : "Mark as completed"}
              aria-label={task.status === "completed" ? "Mark as incomplete" : "Mark as completed"}
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm font-semibold leading-snug line-clamp-2 transition-colors ${
                task.status === "completed"
                  ? "text-zinc-500 line-through decoration-zinc-400"
                  : "text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
              }`}
            >
              {task.title}
            </h3>
          </div>

          {task.url && (
            <button
              onClick={handleOpenUrl}
              className="p-1 rounded text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0 transition-colors"
              title="Open link in new tab"
              aria-label="Open original link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Short Notes Preview */}
        {task.notes && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-md border border-zinc-100 dark:border-zinc-800/60 font-sans">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Notes: </span>
            {task.notes}
          </p>
        )}
      </div>

      {/* Footer Badges & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {task.category && (
            <CategoryBadge name={task.category.name} color={task.category.color} />
          )}
          {task.tags?.slice(0, 2).map((tag) => (
            <TagBadge key={tag.id} name={tag.name} />
          ))}
          {task.tags && task.tags.length > 2 && (
            <span className="text-[10px] text-zinc-400">+{task.tags.length - 2}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isDeleted ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  undoDeleteTask(task.id);
                }}
                className="px-2 py-0.5 rounded text-[11px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Restore
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  permanentlyDeleteTask(task.id);
                }}
                className="px-2 py-0.5 rounded text-[11px] border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          ) : isArchived ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                restoreTask(task.id);
              }}
              className="px-2 py-0.5 rounded text-[11px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Restore
            </button>
          ) : (
            <>
              {taskIsOverdue && <OverdueBadge />}
              {hasDueDate && !taskIsOverdue && (
                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  {formatDate(task.due_date)}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
