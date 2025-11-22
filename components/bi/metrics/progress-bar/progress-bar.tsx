"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/**
 * ProgressBar
 * @description Percentage completion visualization component.
 * Displays progress toward a goal with optional label and value display.
 * @param {ProgressBarProps} props - Component properties
 * @param {number} props.value - Current progress value
 * @param {number} [props.max] - Maximum value (default: 100)
 * @param {string} [props.label] - Progress label/title
 * @param {string} [props.description] - Additional description
 * @param {boolean} [props.showValue] - Display numeric value (default: true)
 * @param {boolean} [props.showPercentage] - Display percentage (default: true)
 * @param {string} [props.variant] - Color variant ("default" | "success" | "warning" | "danger")
 * @param {string} [props.valuePrefix] - Value prefix (e.g., "$")
 * @param {string} [props.valueSuffix] - Value suffix (e.g., "hrs")
 * @param {boolean} [props.asCard] - Wrap in Card component (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} ProgressBar component
 * @example
 * <ProgressBar
 *   value={75}
 *   max={100}
 *   label="Goal Progress"
 *   description="Q4 Sales Target"
 *   variant="success"
 * />
 */

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  description?: string;
  showValue?: boolean;
  showPercentage?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
  valuePrefix?: string;
  valueSuffix?: string;
  asCard?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  description,
  showValue = true,
  showPercentage = true,
  variant = "default",
  valuePrefix = "",
  valueSuffix = "",
  asCard = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100);

  const variantClasses = {
    default: "",
    success: "[&>div]:bg-green-500",
    warning: "[&>div]:bg-yellow-500",
    danger: "[&>div]:bg-red-500",
  };

  const content = (
    <>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showValue && (
            <span className="text-sm text-muted-foreground">
              {valuePrefix}
              {value}
              {valueSuffix}
              {showPercentage && ` (${percentage}%)`}
            </span>
          )}
        </div>
      )}
      <Progress
        value={percentage}
        className={cn(variantClasses[variant], "h-2")}
        aria-label={label || "Progress"}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </>
  );

  if (asCard) {
    return (
      <Card className={className}>
        {label && !showValue && (
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
          </CardHeader>
        )}
        <CardContent className={label && !showValue ? "" : "pt-6"}>
          {content}
        </CardContent>
      </Card>
    );
  }

  return <div className={className}>{content}</div>;
}
