"use client";

export function RunStatusBadge({ status }: { status?: string | null }) {
  const s = (status ?? "").toLowerCase();
  if (s === "completed" || s === "success") {
    return (
      <span className="flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">
        ✓ Completed
      </span>
    );
  }
  if (s === "failed") {
    return (
      <span className="flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 px-2 py-0.5 rounded-full text-xs font-semibold">
        ✗ Failed
      </span>
    );
  }
  if (s === "running" || s === "pending") {
    return (
      <span className="flex items-center gap-1 text-yellow-700 bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse">
        ↻ Running
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-gray-600 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">
      ⏳ Queued
    </span>
  );
}
