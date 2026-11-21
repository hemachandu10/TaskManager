"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TaskWithDetails } from "@/lib/supabase/types";
import { useTasks } from "@/context/TaskContext";
import { PriorityBadge, StatusBadge, CategoryBadge, TagBadge, OverdueBadge } from "@/components/ui/Badge";
import { formatDate, formatRelativeTime, isOverdue } from "@/lib/utils";
import {
  ExternalLink,
  Edit2,
  Calendar,
  Clock,
  CircleDot,
  CheckCircle2,
  Archive,
  Trash2,
  FileText,
  Save,
  RotateCcw,
} from "lucide-react";

interface TaskDetailModalProps {
  task: TaskWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: TaskWithDetails) => void;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onEdit,
}: TaskDetailModalProps) {
  const {
    updateTask,
    updateTaskStatus,
    archiveTask,
    restoreTask,
    softDeleteTask,
    undoDeleteTask,
    permanentlyDeleteTask,
    recordTaskOpened,
  } = useTasks();

  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (task) {
      setNotes(task.notes || "");
      setHasUnsavedChanges(false);
    }
  }, [task]);

  if (!task) return null;

  const hasDueDate = Boolean(task.due_date);
  const taskIsOverdue = hasDueDate && isOverdue(task.due_date) && task.status !== "completed";
  const isArchived = Boolean(task.archived_at);
  const isDeleted = Boolean(task.deleted_at);

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await updateTask(task.id, { notes });
    setIsSavingNotes(false);
    setHasUnsavedChanges(false);
  };

  const handleOpenOriginalUrl = () => {
    if (task.url) {
      recordTaskOpened(task.id, task.url);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {task.favicon_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={task.favicon_url}
              alt=""
              className="w-4 h-4 rounded-xs shrink-0 object-contain"
            />
          )}
          <span className="truncate">{task.title}</span>
        </div>
      }
      description={task.hostname ? `Source: ${task.hostname}` : "Task Details"}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Trash Notice Banner */}
        {isDeleted && (
          <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
              <span>This task is in your <strong>Trash</strong>. Restore it to edit or resume progress.</span>
            </div>
          </div>
        )}

        {/* URL Banner & Action */}
        {task.url && (
          <div className="p-3 rounded-lg border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                Original Page
              </p>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 truncate">
                {task.url}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleOpenOriginalUrl}
              className="shrink-0 gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Page
            </Button>
          </div>
        )}

        {/* Status, Priority, Category, Dates row */}
        <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-lg border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {task.category && (
            <CategoryBadge name={task.category.name} color={task.category.color} />
          )}
          {taskIsOverdue && <OverdueBadge />}
          {hasDueDate && !taskIsOverdue && (
            <span className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
              <Calendar className="w-3 h-3 text-zinc-400" />
              Due: {formatDate(task.due_date)}
            </span>
          )}
          {task.last_opened_at && (
            <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400 ml-auto">
              <Clock className="w-3 h-3 text-zinc-400" />
              Last opened: {formatRelativeTime(task.last_opened_at)}
            </span>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((t) => (
                <TagBadge key={t.id} name={t.name} />
              ))}
            </div>
          </div>
        )}

        {/* Description (if present) */}
        {task.description && (
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Description
            </p>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
              {task.description}
            </p>
          </div>
        )}

        {/* Notes & Saved Progress Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              Notes &amp; Saved Progress
            </label>
            {hasUnsavedChanges && (
              <span className="text-[11px] text-amber-500 font-medium animate-pulse">
                Unsaved edits
              </span>
            )}
          </div>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setHasUnsavedChanges(true);
            }}
            placeholder="Record where you left off, solutions tried, next steps to resume..."
            className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSaveNotes}
              isLoading={isSavingNotes}
              disabled={!hasUnsavedChanges}
              className="gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Progress Notes
            </Button>
          </div>
        </div>

        {/* Modal Actions Footer: Status switch, Edit, Archive, Trash */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          {isDeleted ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-zinc-500">Deleted Task Options:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    undoDeleteTask(task.id);
                    onClose();
                  }}
                  className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore Task
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    permanentlyDeleteTask(task.id);
                    onClose();
                  }}
                  className="gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Permanently
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                {task.status !== "todo" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTaskStatus(task.id, "todo")}
                  >
                    <CircleDot className="w-3.5 h-3.5 text-indigo-500" />
                    To Do
                  </Button>
                )}
                {task.status !== "later" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTaskStatus(task.id, "later")}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Do Later
                  </Button>
                )}
                {task.status !== "completed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTaskStatus(task.id, "completed")}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Complete
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEdit(task);
                  }}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit All
                </Button>

                {isArchived ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      restoreTask(task.id);
                      onClose();
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      archiveTask(task.id);
                      onClose();
                    }}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    softDeleteTask(task.id);
                    onClose();
                  }}
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
