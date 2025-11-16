"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * LoadingState
 * @description Standardized loading skeleton component.
 * Uses skeleton loaders instead of spinners for a more professional loading experience.
 * @param {LoadingStateProps} props - Component properties
 * @param {string} [props.message] - Loading message text
 * @param {"sm" | "md" | "lg"} [props.size] - Skeleton size (default: "md")
 * @param {boolean} [props.fullScreen] - Full screen overlay (default: false)
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.children] - Custom skeleton content
 * @returns {JSX.Element} LoadingState component
 * @example
 * <LoadingState message="Loading dashboard..." />
 * <LoadingState fullScreen>
 *   <Skeleton className="h-20 w-full" />
 * </LoadingState>
 */
export interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: "h-4 w-16",
  md: "h-6 w-24",
  lg: "h-8 w-32",
};

export function LoadingState({
  message = "Loading...",
  size = "md",
  fullScreen = false,
  className,
  children,
}: LoadingStateProps) {
  const content = children || (
    <div className="flex flex-col items-center justify-center gap-3">
      <Skeleton className={cn(sizeClasses[size], "rounded-full")} />
      {message && (
        <Skeleton className="h-4 w-32" />
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={cn("flex items-center justify-center min-h-screen", className)}>
        {content}
      </div>
    );
  }

  return <div className={cn(className)}>{content}</div>;
}
