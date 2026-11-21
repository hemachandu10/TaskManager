"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { TaskProvider } from "@/context/TaskContext";
import { ModalProvider } from "@/context/ModalContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <TaskProvider>
            <ModalProvider>{children}</ModalProvider>
          </TaskProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
