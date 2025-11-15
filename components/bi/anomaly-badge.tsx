"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * AnomalyBadge
 * @description Highlights outliers and anomalies in data.
 * Visual indicator for data points that deviate from expected patterns.
 * @param {AnomalyBadgeProps} props - Component properties
 * @param {string} [props.label] - Badge label text
 * @param {AnomalySeverity} [props.severity] - Severity level ("low" | "medium" | "high")
 * @param {number} [props.value] - Anomaly value or deviation percentage
 * @param {string} [props.description] - Additional context
 * @param {boolean} [props.showIcon] - Show warning icon (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} AnomalyBadge component
 * @example
 * <AnomalyBadge
 *   label="Unusual Traffic"
 *   severity="high"
 *   value={245}
 *   description="+245% from average"
 * />
 */

export type AnomalySeverity = "low" | "medium" | "high";

export interface AnomalyBadgeProps {
  label?: string;
  severity?: AnomalySeverity;
  value?: number;
  description?: string;
  showIcon?: boolean;
  className?: string;
}

const severityStyles = {
  low: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
  medium:
    "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
  high: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
};

export function AnomalyBadge({
  label = "Anomaly",
  severity = "medium",
  value,
  description,
  showIcon = true,
  className,
}: AnomalyBadgeProps) {
  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <Badge
        className={cn(
          "inline-flex items-center gap-1.5",
          severityStyles[severity],
        )}
      >
        {showIcon && <AlertTriangle className="h-3 w-3" />}
        <span>{label}</span>
        {value !== undefined && (
          <span className="font-bold">
            {value > 0 ? "+" : ""}
            {value}%
          </span>
        )}
      </Badge>
      {description && (
        <span className="text-xs text-muted-foreground">{description}</span>
      )}
    </div>
  );
}
