"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Derives status from action type for consistent badge styling.
 */
function getStatusFromActionType(
  actionType: string,
): "success" | "failed" | "in_progress" | "info" {
  if (
    actionType.includes("FAILED") ||
    actionType.includes("DELETED") ||
    actionType.includes("REMOVED")
  ) {
    return "failed";
  }
  if (
    actionType.includes("SUCCEEDED") ||
    actionType.includes("COMPLETED") ||
    actionType.includes("CREATED") ||
    actionType.includes("CONNECTED")
  ) {
    return "success";
  }
  if (
    actionType.includes("STARTED") ||
    actionType.includes("RUN_STARTED") ||
    actionType.includes("UPDATED")
  ) {
    return "in_progress";
  }
  return "info";
}

export interface ActionStatusBadgeProps {
  actionType: string;
  className?: string;
}

/**
 * Reusable badge for displaying status derived from action type.
 * Used in activity logs and similar contexts.
 */
export function ActionStatusBadge({ actionType, className }: ActionStatusBadgeProps) {
  const status = getStatusFromActionType(actionType);
  return (
    <Badge
      variant="secondary"
      className={cn(
        status === "success" &&
          "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30",
        status === "failed" &&
          "bg-destructive/10 text-destructive border-destructive/30",
        status === "in_progress" &&
          "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
        status === "info" &&
          "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30",
        className,
      )}
    >
      {status === "success" && "Success"}
      {status === "failed" && "Failed"}
      {status === "in_progress" && "In Progress"}
      {status === "info" && "Info"}
    </Badge>
  );
}
