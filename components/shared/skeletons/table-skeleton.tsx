"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * TableSkeleton
 * @description Skeleton loader for data tables with header and data rows.
 * Supports optional checkbox and action columns.
 * @param {TableSkeletonProps} props - Component properties
 * @param {number} [props.columnCount] - Number of columns (default: 5)
 * @param {number} [props.rowCount] - Number of rows (default: 5)
 * @param {boolean} [props.showCheckbox] - Show checkbox column (default: false)
 * @param {boolean} [props.showAction] - Show action column (default: false)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} TableSkeleton component
 * @example
 * <TableSkeleton columnCount={6} rowCount={8} />
 * <TableSkeleton columnCount={4} rowCount={5} showCheckbox showAction />
 */
export interface TableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
  showCheckbox?: boolean;
  showAction?: boolean;
  className?: string;
}

export function TableSkeleton({
  columnCount = 5,
  rowCount = 5,
  showCheckbox = false,
  showAction = false,
  className,
}: TableSkeletonProps) {
  const totalColumns =
    columnCount + (showCheckbox ? 1 : 0) + (showAction ? 1 : 0);

  return (
    <div className={cn("w-full rounded-md border", className)}>
      {/* Table Header */}
      <div className="border-b bg-muted/50">
        <div className="flex items-center gap-4 px-4 py-3">
          {showCheckbox && <Skeleton className="h-4 w-4 rounded shrink-0" />}
          {Array.from({ length: columnCount }, (_, index) => (
            <Skeleton
              key={`header-${index}`}
              className="h-4 flex-1"
              style={{
                maxWidth: `${100 / totalColumns}%`,
              }}
            />
          ))}
          {showAction && <Skeleton className="h-4 w-16 rounded shrink-0" />}
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y">
        {Array.from({ length: rowCount }, (_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex items-center gap-4 px-4 py-3"
            style={{
              animationDelay: `${rowIndex * 50}ms`,
            }}
          >
            {showCheckbox && <Skeleton className="h-4 w-4 rounded shrink-0" />}
            {Array.from({ length: columnCount }, (_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                className="h-4 flex-1"
                style={{
                  maxWidth: `${100 / totalColumns}%`,
                }}
              />
            ))}
            {showAction && <Skeleton className="h-8 w-8 rounded shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
