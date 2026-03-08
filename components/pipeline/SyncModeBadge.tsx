"use client";

export function SyncModeBadge({ mode }: { mode: string }) {
  const styles: Record<string, string> = {
    full: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    incremental:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cdc: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };
  const labels: Record<string, string> = {
    full: "Full",
    incremental: "Incremental",
    cdc: "CDC",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
        styles[mode?.toLowerCase()] ?? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {labels[mode?.toLowerCase()] ?? mode ?? "—"}
    </span>
  );
}
