"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { usePipelineBuilderStore } from "../store/pipelineStore";

interface RunStatusBannerProps {
  isRunning: boolean;
  isSuccess?: boolean;
  isFailed?: boolean;
  rowsProcessed?: number;
  duration?: string;
  errorMessage?: string;
}

export function RunStatusBanner({
  isRunning,
  isSuccess,
  isFailed,
  rowsProcessed = 0,
  duration,
  errorMessage,
}: RunStatusBannerProps) {
  if (!isRunning && !isSuccess && !isFailed) return null;

  if (isRunning) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <span>
          Running — {rowsProcessed.toLocaleString()} rows synced
          {duration ? ` — ${duration} elapsed` : ""}
        </span>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-2 text-sm text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4" />
        <span>
          Completed — {rowsProcessed.toLocaleString()} rows
          {duration ? ` in ${duration}` : ""}
        </span>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-2 text-sm text-red-700 dark:text-red-400">
        <XCircle className="h-4 w-4" />
        <span>Failed — {errorMessage ?? "Unknown error"}</span>
      </div>
    );
  }

  return null;
}
