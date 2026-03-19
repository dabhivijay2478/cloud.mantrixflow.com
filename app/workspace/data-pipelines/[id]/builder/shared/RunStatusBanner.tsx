"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";

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
      <div className="flex items-center gap-2.5 rounded-xl border border-blue-500/60 bg-zinc-900/95 px-4 py-2.5 text-sm shadow-lg shadow-blue-500/10">
        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        <span className="text-blue-300 font-medium">
          Running — {rowsProcessed.toLocaleString()} rows synced
          {duration ? ` · ${duration}` : ""}
        </span>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/60 bg-zinc-900/95 px-4 py-2.5 text-sm shadow-lg shadow-emerald-500/10">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <span className="text-emerald-300 font-medium">
          Completed — {rowsProcessed.toLocaleString()} rows
          {duration ? ` in ${duration}` : ""}
        </span>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-red-500/60 bg-zinc-900/95 px-4 py-2.5 text-sm shadow-lg shadow-red-500/10">
        <XCircle className="h-4 w-4 text-red-400" />
        <span className="text-red-300 font-medium">
          Failed — {errorMessage ?? "Unknown error"}
        </span>
      </div>
    );
  }

  return null;
}
