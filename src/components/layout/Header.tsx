"use client";

import React from "react";
import { Menu, Plus, Database } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenTaskModal: () => void;
}

export function Header({ onOpenMobileMenu, onOpenTaskModal }: HeaderProps) {
  const { isConfigured } = useAuth();

  return (
    <header className="sticky top-0 z-20 w-full border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-zinc-200/80 dark:border-zinc-800/80">
      {/* Top Banner if Supabase is pending configuration */}
      {!isConfigured && (
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>Configuration Notice:</strong> Supabase credentials are pending. Running in local preview mode.
            </span>
          </div>
          <span className="text-[11px] font-medium hidden sm:inline opacity-80">
            Set NEXT_PUBLIC_SUPABASE_URL and KEY in .env.local
          </span>
        </div>
      )}

      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile drawer toggle */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenTaskModal}
            size="sm"
            className="gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
