"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

/**
 * LoadingState
 * @description Standardized loading component with logo and message.
 * Uses the application logo with loading text for a branded loading experience.
 * @param {LoadingStateProps} props - Component properties
 * @param {string} [props.message] - Loading message text (default: "Loading...")
 * @param {number} [props.logoSize] - Logo size in pixels (default: 48)
 * @param {boolean} [props.fullScreen] - Full screen overlay (default: false)
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.children] - Custom loading content (overrides default)
 * @returns {JSX.Element} LoadingState component
 * @example
 * <LoadingState message="Loading dashboard..." />
 * <LoadingState fullScreen logoSize={64} />
 * <LoadingState>
 *   <CustomLoadingContent />
 * </LoadingState>
 */
export interface LoadingStateProps {
  message?: string;
  logoSize?: number;
  fullScreen?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function LoadingState({
  message = "Loading...",
  logoSize = 48,
  fullScreen = false,
  className,
  children,
}: LoadingStateProps) {
  const content = children || (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2 px-2 animate-pulse ">
        <Logo className="h-6 w-6 shrink-0" />
        <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
          MantrixFlow
        </span>
      </div>
      {message && (
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={cn(
          "flex items-center justify-center w-full h-screen",
          className,
        )}
      >
        {content}
      </div>
    );
  }

  return <div className={cn(className)}>{content}</div>;
}
