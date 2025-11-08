"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * KPICard
 * @description Key Performance Indicator card displaying a metric with trend indicator.
 * Shows value, label, percentage change, and optional icon.
 * @param {KPICardProps} props - Component properties
 * @param {string | number} props.value - Primary metric value
 * @param {string} props.label - Metric label/description
 * @param {number} [props.change] - Percentage change (positive or negative)
 * @param {string} [props.changeLabel] - Label for change period (e.g., "vs last month")
 * @param {LucideIcon} [props.icon] - Icon component from lucide-react
 * @param {string} [props.prefix] - Value prefix (e.g., "$", "€")
 * @param {string} [props.suffix] - Value suffix (e.g., "%", "K")
 * @param {string} [props.trend] - Manual trend override ("up" | "down" | "neutral")
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} KPICard component
 * @example
 * <KPICard
 *   value="$45,231"
 *   label="Total Revenue"
 *   change={12.5}
 *   changeLabel="vs last month"
 *   icon={DollarSign}
 * />
 */

export interface KPICardProps {
  value: string | number;
  label: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  prefix?: string;
  suffix?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function KPICard({
  value,
  label,
  change,
  changeLabel = "vs last period",
  icon: Icon,
  prefix = "",
  suffix = "",
  trend,
  className,
}: KPICardProps) {
  // Determine trend from change value if not explicitly set
  const trendDirection = trend || (change && change > 0 ? "up" : change && change < 0 ? "down" : "neutral");
  const isPositive = trendDirection === "up";
  const isNegative = trendDirection === "down";

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}
          {value}
          {suffix}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {isPositive && (
              <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-400" />
            )}
            {isNegative && (
              <ArrowDown className="h-3 w-3 text-red-600 dark:text-red-400" />
            )}
            <span
              className={cn({
                "text-green-600 dark:text-green-400": isPositive,
                "text-red-600 dark:text-red-400": isNegative,
              })}
            >
              {Math.abs(change)}%
            </span>
            <span>{changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
