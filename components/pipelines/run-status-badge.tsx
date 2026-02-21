"use client";

import { Loader2 } from "lucide-react";
import { usePipelineRunStatus } from "@/lib/api/hooks/use-pipeline-run-status";
import { cn } from "@/lib/utils";

interface RunStatusBadgeProps {
  pipelineId: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; pulse?: boolean }
> = {
  pending: { label: "Pending", className: "bg-gray-500/10 text-gray-600" },
  queued: { label: "Queued", className: "bg-yellow-500/10 text-yellow-700" },
  running: {
    label: "Running",
    className: "bg-blue-500/10 text-blue-700",
    pulse: true,
  },
  completed: { label: "Completed", className: "bg-green-500/10 text-green-700" },
  failed: { label: "Failed", className: "bg-red-500/10 text-red-700" },
};

export function RunStatusBadge({ pipelineId, className }: RunStatusBadgeProps) {
  const status = usePipelineRunStatus(pipelineId);
  if (!status) return null;

  const config = STATUS_CONFIG[status.status] ?? STATUS_CONFIG.pending;

  return (
    <div className={cn("space-y-1", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
          config.className,
          config.pulse && "animate-pulse"
        )}
      >
        {status.status === "running" && (
          <Loader2 className="h-3 w-3 animate-spin" />
        )}
        {config.label}
        {status.status === "completed" && status.rowsSynced != null && (
          <span className="opacity-80">({status.rowsSynced} rows)</span>
        )}
      </span>
      {status.status === "failed" && status.userMessage && (
        <pre className="mt-1 max-h-24 overflow-auto rounded bg-red-50 p-2 text-xs text-red-800 dark:bg-red-950/30 dark:text-red-200">
          {status.userMessage}
        </pre>
      )}
      {status.status === "completed" &&
        status.startedAt &&
        status.completedAt && (
          <span className="block text-xs text-muted-foreground">
            Duration:{" "}
            {Math.round(
              (new Date(status.completedAt).getTime() -
                new Date(status.startedAt).getTime()) /
                1000
            )}
            s
          </span>
        )}
    </div>
  );
}
