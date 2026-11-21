"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useTasks } from "@/context/TaskContext";
import { Plus, Sparkles, Globe } from "lucide-react";
import { isValidHttpUrl } from "@/lib/utils";

export function QuickAddTask() {
  const { createTask, fetchMetadata } = useTasks();
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    setIsLoading(true);

    let title = trimmed;
    let url: string | undefined = undefined;
    let hostname: string | undefined = undefined;
    let faviconUrl: string | undefined = undefined;
    let description: string | undefined = undefined;

    if (isValidHttpUrl(trimmed)) {
      url = trimmed;
      try {
        const meta = await fetchMetadata(trimmed);
        title = meta.title || trimmed;
        hostname = meta.hostname || undefined;
        faviconUrl = meta.faviconUrl || undefined;
        description = meta.description || undefined;
      } catch {
        // Fallback title to URL
        title = trimmed;
      }
    }

    await createTask({
      title,
      url,
      hostname,
      favicon_url: faviconUrl,
      description,
      status: "todo",
      priority: "medium",
    });

    setInputVal("");
    setIsLoading(false);
  };

  const isUrl = isValidHttpUrl(inputVal.trim());

  return (
    <form
      onSubmit={handleQuickAdd}
      className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
    >
      <div className="relative flex-1">
        {isUrl ? (
          <Globe className="w-4 h-4 absolute left-3 top-3 text-indigo-500" />
        ) : (
          <Plus className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
        )}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Quick save: paste any page URL or type a new task..."
          className="w-full h-9.5 pl-9 pr-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
        />
      </div>

      <Button
        type="submit"
        size="md"
        isLoading={isLoading}
        disabled={!inputVal.trim()}
        className="shrink-0 gap-1.5"
      >
        {isUrl ? (
          <>
            <Sparkles className="w-4 h-4" />
            Save Page
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Quick Add
          </>
        )}
      </Button>
    </form>
  );
}
