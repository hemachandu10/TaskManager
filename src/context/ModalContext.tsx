"use client";

import React, { createContext, useContext, useState } from "react";
import { TaskWithDetails, TaskStatus } from "@/lib/supabase/types";
import { TaskModal } from "@/components/tasks/TaskModal";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";

interface ModalContextType {
  openCreateTask: (status?: TaskStatus) => void;
  openEditTask: (task: TaskWithDetails) => void;
  openDetails: (task: TaskWithDetails) => void;
  closeModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithDetails | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<TaskWithDetails | null>(null);

  const openCreateTask = (status: TaskStatus = "todo") => {
    setTaskToEdit(null);
    setDefaultStatus(status);
    setIsTaskModalOpen(true);
  };

  const openEditTask = (task: TaskWithDetails) => {
    setTaskToEdit(task);
    setIsDetailModalOpen(false);
    setIsTaskModalOpen(true);
  };

  const openDetails = (task: TaskWithDetails) => {
    setDetailTask(task);
    setIsDetailModalOpen(true);
  };

  const closeModals = () => {
    setIsTaskModalOpen(false);
    setIsDetailModalOpen(false);
    setTaskToEdit(null);
    setDetailTask(null);
  };

  return (
    <ModalContext.Provider
      value={{
        openCreateTask,
        openEditTask,
        openDetails,
        closeModals,
      }}
    >
      {children}

      {/* Global Task Creation/Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultStatus={defaultStatus}
      />

      {/* Global Task Detail / Quick Notes Modal */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        task={detailTask}
        onEdit={openEditTask}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
