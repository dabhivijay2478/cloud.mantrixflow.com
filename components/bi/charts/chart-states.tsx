"use client";

import { Loader2, AlertCircle, BarChart3 } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Chart Loading State
 */
export function ChartLoadingState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full min-h-[200px] gap-2",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading chart data"
    >
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading chart data...</p>
    </div>
  );
}

/**
 * Chart Error State
 */
export function ChartErrorState({
  error,
  className,
}: {
  error?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full min-h-[200px] gap-2",
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-6 w-6 text-destructive" />
      <p className="text-sm font-medium text-destructive">Error loading chart</p>
      {error && (
        <p className="text-xs text-muted-foreground max-w-md text-center">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Chart Empty State
 */
export function ChartEmptyState({
  message = "No data available",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full min-h-[200px] gap-2",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <BarChart3 className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

