"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CircleDot,
  Clock,
  CheckCircle2,
  Archive,
  Trash2,
  Plus,
  BookmarkCheck,
  LogOut,
  Settings,
} from "lucide-react";
import { useTasks } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onOpenTaskModal: () => void;
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ onOpenTaskModal, className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { stats } = useTasks();
  const { user, profile, signOut, isConfigured } = useAuth();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      count: null,
    },
    {
      href: "/todo",
      label: "To Do",
      icon: CircleDot,
      count: stats.todoCount,
      countColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400",
    },
    {
      href: "/later",
      label: "Do Later",
      icon: Clock,
      count: stats.laterCount,
      countColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
    },
    {
      href: "/completed",
      label: "Completed",
      icon: CheckCircle2,
      count: stats.completedCount,
      countColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
    },
    {
      href: "/archived",
      label: "Archived",
      icon: Archive,
      count: stats.archivedCount > 0 ? stats.archivedCount : null,
      countColor: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    },
    {
      href: "/trash",
      label: "Trash",
      icon: Trash2,
      count: stats.deletedCount > 0 ? stats.deletedCount : null,
      countColor: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      count: null,
    },
  ];

  const handleLinkClick = () => {
    if (onNavigate) onNavigate();
  };

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Demo User";

  return (
    <aside
      className={cn(
        "w-64 h-full flex flex-col justify-between border-r bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 p-4 shrink-0 select-none",
        className
      )}
    >
      <div className="space-y-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center justify-between px-2 py-1">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 font-bold text-base text-zinc-900 dark:text-zinc-100 group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-none text-sm tracking-tight">TaskVault</span>
              <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500">
                Productivity Hub
              </span>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        {/* Prominent Add Task Action */}
        <button
          onClick={() => {
            onOpenTaskModal();
            handleLinkClick();
          }}
          className="w-full h-9.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150",
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-400 dark:text-zinc-500"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.count !== null && item.count !== undefined && (
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px] font-semibold",
                      item.countColor
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Account & Footer */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-zinc-400 truncate">
                {isConfigured ? user?.email || "Connected" : "Local Preview"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/settings"
              onClick={handleLinkClick}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
            {isConfigured && user ? (
              <button
                onClick={() => signOut()}
                className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                href="/login"
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-1"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
