"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardArrowProps {
  isRunning?: boolean;
  throughput?: string;
  lastRunRows?: number;
  className?: string;
}

export function CardArrow({
  isRunning,
  throughput,
  lastRunRows,
  className,
}: CardArrowProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-2 min-w-[48px]",
        className,
      )}
      aria-hidden
    >
      <div
        className={cn(
          "rounded-full p-1",
          isRunning && "animate-pulse bg-blue-500/20",
        )}
      >
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
      {(throughput || lastRunRows != null) && (
        <span className="mt-1 text-xs text-muted-foreground text-center">
          {isRunning && throughput ? throughput : null}
          {!isRunning && lastRunRows != null
            ? `↳ ${lastRunRows.toLocaleString()} rows`
            : null}
        </span>
      )}
    </div>
  );
}
