"use client";

import type * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  value: string | number;
  indicatorColor?: string;
  valueColor?: string;
  className?: string;
}

/**
 * MetricCard
 * @description Reusable metric card component for displaying statistics with label, value, and optional color indicators
 * @param {MetricCardProps} props - Component properties
 * @param {string} props.label - Metric label
 * @param {string | number} props.value - Metric value
 * @param {string} [props.indicatorColor] - Color for the indicator dot (default: muted-foreground)
 * @param {string} [props.valueColor] - Color for the value text (default: foreground)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} MetricCard component
 * @example
 * <MetricCard
 *   label="Total"
 *   value={100}
 *   indicatorColor="bg-muted-foreground"
 *   valueColor="text-foreground"
 * />
 */
export function MetricCard({
  label,
  value,
  indicatorColor = "bg-muted-foreground",
  valueColor,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("bg-card", className)}>
      <CardContent className="py-1.5 px-2">
        <div className="flex items-center gap-1 mb-1">
          <div className={cn("w-2 h-2 rounded-full", indicatorColor)} />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
        </div>
        <div className={cn("text-2xl font-semibold", valueColor)}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
