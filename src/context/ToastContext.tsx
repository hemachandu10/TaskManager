"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, action?: ToastAction, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, action?: ToastAction) => void;
  error: (message: string) => void;
  info: (message: string, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", action?: ToastAction, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, message, action, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, action?: ToastAction) => showToast(message, "success", action),
    [showToast]
  );

  const error = useCallback((message: string) => showToast(message, "error"), [showToast]);

  const info = useCallback(
    (message: string, action?: ToastAction) => showToast(message, "info", action),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, info }}>
      {children}
      {/* Toast container floating at bottom right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-lg border shadow-lg text-sm transition-all duration-200 animate-in slide-in-from-bottom-3",
              toast.type === "success" &&
                "bg-zinc-900 border-emerald-500/30 text-zinc-100 dark:bg-zinc-900 dark:border-emerald-500/30",
              toast.type === "error" &&
                "bg-zinc-900 border-rose-500/30 text-zinc-100 dark:bg-zinc-900 dark:border-rose-500/30",
              toast.type === "info" &&
                "bg-zinc-900 border-zinc-700 text-zinc-100 dark:bg-zinc-900 dark:border-zinc-700"
            )}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {toast.type === "success" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {toast.type === "error" && (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              {toast.type === "info" && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
              <span className="truncate">{toast.message}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    removeToast(toast.id);
                  }}
                  className="px-2 py-1 text-xs font-semibold rounded bg-zinc-800 hover:bg-zinc-700 text-indigo-300 hover:text-indigo-200 border border-zinc-700 transition-colors"
                >
                  {toast.action.label}
                </button>
              )}
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
