"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * PageHeaderSkeleton
 * @description Skeleton loader for page headers with title, subtitle, and action buttons.
 * Matches the layout of PageHeader component.
 * @param {PageHeaderSkeletonProps} props - Component properties
 * @param {boolean} [props.showSubtitle] - Show subtitle skeleton (default: true)
 * @param {boolean} [props.showAction] - Show action button skeleton (default: true)
 * @param {boolean} [props.showBreadcrumbs] - Show breadcrumbs skeleton (default: false)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} PageHeaderSkeleton component
 * @example
 * <PageHeaderSkeleton />
 * <PageHeaderSkeleton showSubtitle={false} showAction={false} />
 */
export interface PageHeaderSkeletonProps {
  showSubtitle?: boolean;
  showAction?: boolean;
  showBreadcrumbs?: boolean;
  className?: string;
}

export function PageHeaderSkeleton({
  showSubtitle = true,
  showAction = true,
  showBreadcrumbs = false,
  className,
}: PageHeaderSkeletonProps) {
  return (
    <div className={cn("space-y-2 pb-3", className)}>
      {showBreadcrumbs && (
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-48 sm:h-7" />
            {showSubtitle && <Skeleton className="h-4 w-64" />}
          </div>
        </div>
        {showAction && (
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-9 w-24 sm:w-32" />
          </div>
        )}
      </div>
    </div>
  );
}
