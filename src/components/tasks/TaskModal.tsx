"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTasks } from "@/context/TaskContext";
import { TaskWithDetails, TaskPriority, TaskStatus } from "@/lib/supabase/types";
import { Sparkles, Globe, Plus, Tag as TagIcon, AlertCircle } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskWithDetails | null;
  defaultStatus?: TaskStatus;
}

export function TaskModal({
  isOpen,
  onClose,
  taskToEdit,
  defaultStatus = "todo",
}: TaskModalProps) {
  const { createTask, updateTask, categories, tags, createCategory, createTag, fetchMetadata } =
    useTasks();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [hostname, setHostname] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [categoryId, setCategoryId] = useState<string>("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>("");

  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadataWarning, setMetadataWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  // Quick category/tag creation inline
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setUrl(taskToEdit.url || "");
      setHostname(taskToEdit.hostname || "");
      setFaviconUrl(taskToEdit.favicon_url || "");
      setDescription(taskToEdit.description || "");
      setNotes(taskToEdit.notes || "");
      setStatus(taskToEdit.status || "todo");
      setPriority(taskToEdit.priority || "medium");
      setCategoryId(taskToEdit.category_id || "");
      setSelectedTagIds(taskToEdit.tags?.map((t) => t.id) || []);
      setDueDate(taskToEdit.due_date ? taskToEdit.due_date.split("T")[0] : "");
    } else {
      setTitle("");
      setUrl("");
      setHostname("");
      setFaviconUrl("");
      setDescription("");
      setNotes("");
      setStatus(defaultStatus);
      setPriority("medium");
      setCategoryId("");
      setSelectedTagIds([]);
      setDueDate("");
    }
    setMetadataWarning(null);
    setTitleError(null);
  }, [taskToEdit, defaultStatus, isOpen]);

  const handleFetchMetadata = async () => {
    if (!url.trim()) return;
    setIsFetchingMetadata(true);
    setMetadataWarning(null);

    try {
      const data = await fetchMetadata(url.trim());
      if (data.title && !title) {
        setTitle(data.title);
      }
      if (data.description && !description) {
        setDescription(data.description);
      }
      if (data.hostname) {
        setHostname(data.hostname);
      }
      if (data.faviconUrl) {
        setFaviconUrl(data.faviconUrl);
      }
      if (data.warning) {
        setMetadataWarning(data.warning);
      }
    } catch {
      setMetadataWarning("Could not retrieve automatic metadata for this link");
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const handleCreateNewCategory = async () => {
    if (!newCatName.trim()) return;
    const cat = await createCategory(newCatName.trim());
    if (cat) {
      setCategoryId(cat.id);
      setNewCatName("");
      setIsCreatingCategory(false);
    }
  };

  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag(newTagName.trim());
    if (tag) {
      if (!selectedTagIds.includes(tag.id)) {
        setSelectedTagIds([...selectedTagIds, tag.id]);
      }
      setNewTagName("");
      setIsCreatingTag(false);
    }
  };

  const toggleTagSelection = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError("Please provide a task title");
      return;
    }

    setIsSubmitting(true);
    setTitleError(null);

    const payload = {
      title: title.trim(),
      url: url.trim() || undefined,
      hostname: hostname.trim() || undefined,
      favicon_url: faviconUrl.trim() || undefined,
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
      priority,
      category_id: categoryId || undefined,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      tag_ids: selectedTagIds,
    };

    let result;
    if (taskToEdit) {
      result = await updateTask(taskToEdit.id, payload);
    } else {
      result = await createTask(payload);
    }

    setIsSubmitting(false);
    if (result.success) {
      onClose();
    } else if (result.error) {
      setTitleError(result.error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? "Edit Task" : "Add Task to Vault"}
      description="Save a coding challenge, tutorial, documentation page, or personal task."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Title Input */}
        <div>
          <Input
            label="Title *"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError(null);
            }}
            placeholder="e.g. LeetCode 42: Trapping Rain Water"
            error={titleError || undefined}
            autoFocus
          />
        </div>

        {/* URL Input & Metadata Fetcher */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Original URL (Optional)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => {
                  if (url.trim() && !hostname && !taskToEdit) {
                    handleFetchMetadata();
                  }
                }}
                placeholder="https://..."
                className="w-full h-9.5 pl-9 pr-3 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleFetchMetadata}
              isLoading={isFetchingMetadata}
              disabled={!url.trim()}
              title="Auto-fetch page title, hostname, and preview"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Fetch Info
            </Button>
          </div>
          {metadataWarning && (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pt-0.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {metadataWarning}
            </p>
          )}
        </div>

        {/* Status & Priority Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Task Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full h-9.5 px-3 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 cursor-pointer"
            >
              <option value="todo">To Do</option>
              <option value="later">Do Later</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full h-9.5 px-3 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 cursor-pointer"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

        {/* Category & Due Date Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Category
              </label>
              {!isCreatingCategory && (
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(true)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              )}
            </div>

            {isCreatingCategory ? (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category name"
                  className="w-full h-9 px-2 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Button type="button" size="sm" onClick={handleCreateNewCategory}>
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingCategory(false)}
                >
                  ✕
                </Button>
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-9.5 px-3 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 cursor-pointer"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-9.5 px-3 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Tags Selection */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Tags
            </label>
            {!isCreatingTag && (
              <button
                type="button"
                onClick={() => setIsCreatingTag(true)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> New Tag
              </button>
            )}
          </div>

          {isCreatingTag ? (
            <div className="flex gap-1.5 mb-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="tag-name (e.g. dynamic-programming)"
                className="w-full h-8 px-2 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Button type="button" size="sm" onClick={handleCreateNewTag}>
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCreatingTag(false)}
              >
                ✕
              </Button>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            {tags.length === 0 ? (
              <span className="text-xs text-zinc-400 py-1 px-1">No tags yet. Click &quot;New Tag&quot; to add one.</span>
            ) : (
              tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTagSelection(tag.id)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white font-medium"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <TagIcon className="w-3 h-3" />
                    {tag.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Notes & Saved Progress */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Notes &amp; Saved Progress
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record what remains to be done, timestamps, key algorithms, or personal thoughts..."
            className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {taskToEdit ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
