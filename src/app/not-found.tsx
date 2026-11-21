import Link from "next/link";
import { BookmarkCheck, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 flex items-center justify-center mb-4">
        <BookmarkCheck className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">404</h1>
      <h2 className="text-lg font-semibold mb-1">Page not found</h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
        The task, vault collection, or page you were looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}
