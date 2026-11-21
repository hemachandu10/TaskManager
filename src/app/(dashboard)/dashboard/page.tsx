"use client";

import React from "react";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { useModal } from "@/context/ModalContext";

export default function DashboardPage() {
  const { openCreateTask, openEditTask, openDetails } = useModal();

  return (
    <DashboardOverview
      onOpenTaskModal={() => openCreateTask()}
      onEditTask={openEditTask}
      onOpenDetails={openDetails}
    />
  );
}
