"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PageHeaderSkeleton } from "./page-header-skeleton";
import { TableSkeleton } from "./table-skeleton";

/**
 * LogsSkeleton
 * @description Skeleton loader for logs/activity pages with header, filters, and table.
 * Combines PageHeaderSkeleton, filter bar, and TableSkeleton.
 * @param {LogsSkeletonProps} props - Component properties
 * @param {number} [props.columnCount] - Number of table columns (default: 5)
 * @param {number} [props.rowCount] - Number of table rows (default: 8)
 * @param {boolean} [props.showFilters] - Show filter bar skeleton (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} LogsSkeleton component
 * @example
 * <LogsSkeleton />
 * <LogsSkeleton columnCount={6} rowCount={10} showFilters={false} />
 */
export interface LogsSkeletonProps {
  columnCount?: number;
  rowCount?: number;
  showFilters?: boolean;
  className?: string;
}

export function LogsSkeleton({
  columnCount = 5,
  rowCount = 8,
  showFilters = true,
  className,
}: LogsSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Page Header */}
      <PageHeaderSkeleton showAction={true} />

      {/* Filter Bar */}
      {showFilters && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-10 w-full sm:w-64" />
            <Skeleton className="h-10 w-full sm:w-32" />
            <Skeleton className="h-10 w-full sm:w-32" />
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      )}

      {/* Table */}
      <TableSkeleton columnCount={columnCount} rowCount={rowCount} />
    </div>
  );
}
