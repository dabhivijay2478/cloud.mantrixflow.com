"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * StatChange
 * @description Numeric delta indicator with arrow and percentage.
 * Shows change in metrics with visual direction indicators.
 * @param {StatChangeProps} props - Component properties
 * @param {number} props.value - Change value
 * @param {boolean} [props.isPercentage] - Value is a percentage (default: true)
 * @param {boolean} [props.invertColors] - Invert color logic (green=down, red=up)
 * @param {string} [props.label] - Additional label text
 * @param {StatChangeSize} [props.size] - Component size ("sm" | "md" | "lg")
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} StatChange component
 * @example
 * <StatChange value={12.5} label="vs last month" />
 * <StatChange value={-5.2} label="vs last quarter" />
 * <StatChange value={0} label="no change" />
 */

export type StatChangeSize = "sm" | "md" | "lg";

export interface StatChangeProps {
  value: number;
  isPercentage?: boolean;
  invertColors?: boolean;
  label?: string;
  size?: StatChangeSize;
  className?: string;
}

const sizeStyles = {
  sm: {
    text: "text-xs",
    icon: "h-3 w-3",
  },
  md: {
    text: "text-sm",
    icon: "h-4 w-4",
  },
  lg: {
    text: "text-base",
    icon: "h-5 w-5",
  },
};

export function StatChange({
  value,
  isPercentage = true,
  invertColors = false,
  label,
  size = "md",
  className,
}: StatChangeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const colorClass = cn({
    "text-green-600 dark:text-green-400": invertColors ? isNegative : isPositive,
    "text-red-600 dark:text-red-400": invertColors ? isPositive : isNegative,
    "text-muted-foreground": isNeutral,
  });

  const Icon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <Icon className={cn(sizeStyles[size].icon, colorClass)} />
      <span className={cn("font-medium", sizeStyles[size].text, colorClass)}>
        {Math.abs(value)}
        {isPercentage && "%"}
      </span>
      {label && (
        <span className={cn(sizeStyles[size].text, "text-muted-foreground")}>
          {label}
        </span>
      )}
    </div>
  );
}
