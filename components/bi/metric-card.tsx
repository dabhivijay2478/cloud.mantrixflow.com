"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * MetricCard
 * @description Simple big number display card for showcasing key metrics.
 * Clean design focused on the primary value with optional supporting text.
 * @param {MetricCardProps} props - Component properties
 * @param {string | number} props.value - Primary metric value
 * @param {string} props.label - Metric label/title
 * @param {string} [props.description] - Additional description or context
 * @param {string} [props.prefix] - Value prefix (e.g., "$", "€")
 * @param {string} [props.suffix] - Value suffix (e.g., "%", "K", "M")
 * @param {LucideIcon} [props.icon] - Icon component from lucide-react
 * @param {string} [props.iconColor] - Icon color class
 * @param {string} [props.valueColor] - Value text color class
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} MetricCard component
 * @example
 * <MetricCard
 *   value="1,234"
 *   label="Active Users"
 *   description="Currently online"
 *   prefix=""
 *   suffix="K"
 *   icon={Users}
 * />
 */

export interface MetricCardProps {
  value: string | number;
  label: string;
  description?: string;
  prefix?: string;
  suffix?: string;
  icon?: LucideIcon;
  iconColor?: string;
  valueColor?: string;
  className?: string;
}

export function MetricCard({
  value,
  label,
  description,
  prefix = "",
  suffix = "",
  icon: Icon,
  iconColor = "text-muted-foreground",
  valueColor,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("h-full overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {Icon && (
          <Icon className={cn("h-5 w-5", iconColor)} aria-hidden="true" />
        )}
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold tracking-tight", valueColor)}>
          {prefix}
          {value}
          {suffix}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
