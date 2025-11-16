"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * DashboardCardSkeleton
 * @description Skeleton loader for dashboard cards with staggered animation.
 * @param {DashboardCardSkeletonProps} props - Component properties
 * @param {number} [props.count] - Number of skeleton cards to render (default: 1)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} DashboardCardSkeleton component
 */
export interface DashboardCardSkeletonProps {
  count?: number;
  className?: string;
}

export function DashboardCardSkeleton({
  count = 1,
  className,
}: DashboardCardSkeletonProps) {
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
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-3/4" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

