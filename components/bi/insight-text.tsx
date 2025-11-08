"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * InsightText
 * @description Inline AI-generated summary or insight.
 * Compact text component for displaying key insights and observations.
 * @param {InsightTextProps} props - Component properties
 * @param {string} props.text - Insight text content
 * @param {InsightType} [props.type] - Insight type ("positive" | "negative" | "neutral" | "info")
 * @param {boolean} [props.showIcon] - Show AI sparkle icon (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} InsightText component
 * @example
 * <InsightText
 *   text="Sales increased by 23% compared to last quarter"
 *   type="positive"
 * />
 */

export type InsightType = "positive" | "negative" | "neutral" | "info";

export interface InsightTextProps {
  text: string;
  type?: InsightType;
  showIcon?: boolean;
  className?: string;
}

const typeStyles = {
  positive: "text-green-700 dark:text-green-400",
  negative: "text-red-700 dark:text-red-400",
  neutral: "text-muted-foreground",
  info: "text-blue-700 dark:text-blue-400",
};

export function InsightText({
  text,
  type = "neutral",
  showIcon = true,
  className,
}: InsightTextProps) {
  return (
    <p className={cn("flex items-start gap-2 text-sm", typeStyles[type], className)}>
      {showIcon && (
        <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      )}
      <span>{text}</span>
    </p>
  );
}
