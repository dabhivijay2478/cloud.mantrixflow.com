"use client";

import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const trendDirection =
    trend ||
    (change && change > 0 ? "up" : change && change < 0 ? "down" : "neutral");
  const isPositive = trendDirection === "up";
  const isNegative = trendDirection === "down";

  return (
    <Card className={cn("h-full overflow-hidden border transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">
          {prefix}
          {value}
          {suffix}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1.5 text-sm mt-2">
            {isPositive && (
              <ArrowUp className="h-4 w-4 text-[hsl(var(--success))]" />
            )}
            {isNegative && (
              <ArrowDown className="h-4 w-4 text-destructive" />
            )}
            <span
              className={cn("font-medium", {
                "text-[hsl(var(--success))]": isPositive,
                "text-destructive": isNegative,
                "text-muted-foreground": trendDirection === "neutral",
              })}
            >
              {Math.abs(change)}%
            </span>
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
