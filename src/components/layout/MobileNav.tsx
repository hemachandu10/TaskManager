"use client";

import React, { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { X } from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTaskModal: () => void;
}

export function MobileNav({ isOpen, onClose, onOpenTaskModal }: MobileNavProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar
          onOpenTaskModal={onOpenTaskModal}
          onNavigate={onClose}
          className="w-full h-full border-r-0"
        />
      </div>
    </div>
  );
}
