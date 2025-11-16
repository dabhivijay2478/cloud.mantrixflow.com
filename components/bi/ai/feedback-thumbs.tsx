"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * FeedbackThumbs
 * @description Like/dislike feedback component for AI output.
 * Collects user feedback on generated insights and dashboards.
 * @param {FeedbackThumbsProps} props - Component properties
 * @param {(feedback: "positive" | "negative") => void} [props.onFeedback] - Feedback handler
 * @param {string} [props.value] - Current feedback value
 * @param {boolean} [props.disabled] - Disabled state
 * @param {FeedbackThumbsSize} [props.size] - Component size
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} FeedbackThumbs component
 * @example
 * <FeedbackThumbs
 *   onFeedback={(feedback) => {
 *     console.log("User feedback:", feedback);
 *     submitFeedback(feedback);
 *   }}
 * />
 */

export type FeedbackThumbsSize = "sm" | "default" | "lg";
export type FeedbackValue = "positive" | "negative" | null;

export interface FeedbackThumbsProps {
  onFeedback?: (feedback: "positive" | "negative") => void;
  value?: FeedbackValue;
  disabled?: boolean;
  size?: FeedbackThumbsSize;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  default: "h-9 w-9",
  lg: "h-10 w-10",
};

const iconSizeClasses = {
  sm: "h-3 w-3",
  default: "h-4 w-4",
  lg: "h-5 w-5",
};

export function FeedbackThumbs({
  onFeedback,
  value: controlledValue,
  disabled = false,
  size = "default",
  className,
}: FeedbackThumbsProps) {
  const [internalValue, setInternalValue] = React.useState<FeedbackValue>(null);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleFeedback = (feedback: "positive" | "negative") => {
    // Toggle off if clicking the same button
    const newValue = value === feedback ? null : feedback;

    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }

    if (newValue !== null) {
      onFeedback?.(newValue);
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground mr-1">
        Was this helpful?
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback("positive")}
        disabled={disabled}
        className={cn(
          sizeClasses[size],
          value === "positive" &&
            "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
        )}
        aria-label="Positive feedback"
        aria-pressed={value === "positive"}
      >
        <ThumbsUp className={iconSizeClasses[size]} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback("negative")}
        disabled={disabled}
        className={cn(
          sizeClasses[size],
          value === "negative" &&
            "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
        )}
        aria-label="Negative feedback"
        aria-pressed={value === "negative"}
      >
        <ThumbsDown className={iconSizeClasses[size]} />
      </Button>
    </div>
  );
}
