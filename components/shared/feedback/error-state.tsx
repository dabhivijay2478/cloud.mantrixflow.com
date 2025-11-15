"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ErrorState
 * @description Standardized error display component with optional retry functionality.
 * Used for displaying errors consistently across the application.
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
    <Alert variant="destructive" className={cn(className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">{errorMessage}</AlertDescription>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {retryLabel}
          </Button>
        </div>
      )}
    </Alert>
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
