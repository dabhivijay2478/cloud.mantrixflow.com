"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * TrendLabel
 * @description Descriptive trend tag with icon.
 * Displays trend direction with semantic labels like "Rising", "Falling", etc.
 * @param {TrendLabelProps} props - Component properties
 * @param {TrendDirection} props.trend - Trend direction
 * @param {string} [props.label] - Custom label (overrides default trend label)
 * @param {boolean} [props.showIcon] - Show trend icon (default: true)
 * @param {TrendLabelVariant} [props.variant] - Visual variant
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} TrendLabel component
 * @example
 * <TrendLabel trend="up" />
 * <TrendLabel trend="down" label="Declining" />
 * <TrendLabel trend="stable" variant="outline" />
 */

export type TrendDirection = "up" | "down" | "stable";
export type TrendLabelVariant = "default" | "outline" | "secondary";

export interface TrendLabelProps {
  trend: TrendDirection;
  label?: string;
  showIcon?: boolean;
  variant?: TrendLabelVariant;
  className?: string;
}

const defaultLabels = {
  up: "Rising",
  down: "Falling",
  stable: "Stable",
};

const trendStyles = {
  up: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  down: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  stable:
    "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800/30 dark:text-gray-400",
};

export function TrendLabel({
  trend,
  label,
  showIcon = true,
  variant = "default",
  className,
}: TrendLabelProps) {
  const displayLabel = label || defaultLabels[trend];
  const Icon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <Badge
      variant={variant}
      className={cn(
        "inline-flex items-center gap-1.5",
        variant === "default" && trendStyles[trend],
        className,
      )}
    >
      {showIcon && Icon && <Icon className="h-3 w-3" />}
      <span>{displayLabel}</span>
    </Badge>
  );
}
