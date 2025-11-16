"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ErrorState
 * @description Standardized error display component with optional retry functionality.
 * Modern card-based design with better visual hierarchy.
 * @param {ErrorStateProps} props - Component properties
 * @param {Error | string} props.error - Error object or error message string
 * @param {string} [props.title] - Error title (default: "Something went wrong")
 * @param {string} [props.retryLabel] - Retry button label (default: "Try again")
 * @param {() => void} [props.onRetry] - Retry button click handler
 * @param {boolean} [props.centered] - Center the error state (default: false)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} ErrorState component
 * @example
 * <ErrorState
 *   error={error}
 *   title="Failed to load dashboard"
 *   onRetry={() => refetch()}
 * />
 */
export interface ErrorStateProps {
  error: Error | string;
  title?: string;
  retryLabel?: string;
  onRetry?: () => void;
  centered?: boolean;
  className?: string;
}

export function ErrorState({
  error,
  title = "Something went wrong",
  retryLabel = "Try again",
  onRetry,
  centered = false,
  className,
}: ErrorStateProps) {
  const errorMessage =
    typeof error === "string"
      ? error
      : error?.message || "An unexpected error occurred";

  const content = (
    <Card className={cn("border-destructive/50 bg-destructive/5", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {retryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-full max-w-md">{content}</div>
      </div>
    );
  }

  return content;
}
