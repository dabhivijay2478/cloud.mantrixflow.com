"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * LoadingState
 * @description Standardized loading spinner and message component.
 * Used across pages and components for consistent loading experience.
 * @param {LoadingStateProps} props - Component properties
 * @param {string} [props.message] - Loading message text
 * @param {"sm" | "md" | "lg"} [props.size] - Spinner size (default: "md")
 * @param {boolean} [props.fullScreen] - Full screen overlay (default: false)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} LoadingState component
 * @example
 * <LoadingState message="Loading dashboard..." />
 * <LoadingState fullScreen message="Please wait..." />
 */
export interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function LoadingState({
  message = "Loading...",
  size = "md",
  fullScreen = false,
  className,
}: LoadingStateProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2
        className={cn(
          "animate-spin text-primary mb-4",
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {content}
      </div>
    );
  }

  return content;
}

