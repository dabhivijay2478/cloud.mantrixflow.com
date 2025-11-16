"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * DataSourceCardSkeleton
 * @description Skeleton loader for data source cards.
 * @param {DataSourceCardSkeletonProps} props - Component properties
 * @param {number} [props.count] - Number of skeleton cards to render (default: 1)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} DataSourceCardSkeleton component
 */
export interface DataSourceCardSkeletonProps {
  count?: number;
  className?: string;
}

export function DataSourceCardSkeleton({
  count = 1,
  className,
}: DataSourceCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className={cn("overflow-hidden border", className)}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-8 rounded shrink-0" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

