"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useTasks } from "@/context/TaskContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Settings, User, Palette, Database, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";

export default function SettingsPage() {
  const { user, profile, isConfigured, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { resetDemoData } = useTasks();
  const toast = useToast();

  const [displayName, setDisplayName] = useState(
    profile?.display_name || user?.user_metadata?.full_name || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await updateProfile(displayName.trim());
    setIsSaving(false);
    if (error) {
      toast.error(error.message || "Failed to update profile");
    } else {
      toast.success("Profile preferences updated");
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          Account &amp; Vault Settings
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Manage your personal profile, theme preferences, and database connectivity.
        </p>
      </div>

      {/* Database & Cloud Connection Status */}
      <div className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <Database className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Database &amp; Supabase Connection
          </h2>
        </div>

        {isConfigured ? (
          <div className="p-3.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="font-semibold">Supabase Connected</p>
              <p className="opacity-90">
                Your PostgreSQL database and authentication provider are active and synced.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              Local Preview Mode Active
            </div>
            <p>
              To enable cloud persistence, user accounts, and Row-Level Security, configure your project keys in <code>.env.local</code>:
            </p>
            <pre className="p-2.5 rounded bg-zinc-900 text-zinc-100 text-[11px] overflow-x-auto font-mono">
              NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co&#10;NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
            </pre>
          </div>
        )}
      </div>

      {/* Theme & Display Preferences */}
      <div className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <Palette className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Appearance &amp; Theme
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Color Theme
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Choose between light and dark modes. Persisted locally.
            </p>
          </div>
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100 dark:bg-zinc-800">
            <button
              onClick={() => setTheme("light")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                theme === "light"
                  ? "bg-white text-zinc-900 shadow-xs font-semibold"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                theme === "dark"
                  ? "bg-zinc-900 text-zinc-100 shadow-xs font-semibold"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <User className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            User Profile
          </h2>
        </div>

        <Input
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your Name"
        />

        <Input
          label="Email"
          value={user?.email || "preview-user@taskvault.local"}
          disabled
          helperText="Email is managed through your Supabase Auth provider."
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" size="sm" isLoading={isSaving}>
            Save Preferences
          </Button>
        </div>
      </form>

      {/* Local Preview Demo Data Reset */}
      {!isConfigured && (
        <div className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-500" />
                Local Demo Vault Reset
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Reset your locally created tasks, categories, and tags back to the initial sample data set.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetDemoData}
              className="gap-1.5 shrink-0 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Tasks
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
