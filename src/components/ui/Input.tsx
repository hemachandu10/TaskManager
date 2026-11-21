import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full h-9.5 px-3 rounded-lg border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
            "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100",
            error
              ? "border-rose-500 focus:ring-rose-500 focus:border-rose-500"
              : "border-zinc-300 dark:border-zinc-800",
            "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
