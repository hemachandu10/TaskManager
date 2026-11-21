import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-200/70 dark:bg-zinc-800/60",
        className
      )}
      {...props}
    />
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="w-24 h-4" />
        </div>
        <Skeleton className="w-16 h-4" />
      </div>
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-full h-4" />
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-14 h-4" />
          <Skeleton className="w-14 h-4" />
        </div>
        <Skeleton className="w-20 h-4" />
      </div>
    </div>
  );
}
