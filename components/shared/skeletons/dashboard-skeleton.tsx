"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * DashboardSkeleton
 * @description Skeleton loader for dashboard pages with metric cards, charts, and activity lists.
 * @param {DashboardSkeletonProps} props - Component properties
 * @param {number} [props.metricCardCount] - Number of metric cards (default: 4)
 * @param {boolean} [props.showChart] - Show chart placeholder (default: true)
 * @param {boolean} [props.showActivity] - Show activity list (default: true)
 * @param {number} [props.activityItemCount] - Number of activity items (default: 5)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} DashboardSkeleton component
 * @example
 * <DashboardSkeleton />
 * <DashboardSkeleton metricCardCount={3} showChart={false} />
 */
export interface DashboardSkeletonProps {
  metricCardCount?: number;
  showChart?: boolean;
  showActivity?: boolean;
  activityItemCount?: number;
  className?: string;
}

export function DashboardSkeleton({
  metricCardCount = 4,
  showChart = true,
  showActivity = true,
  activityItemCount = 5,
  className,
}: DashboardSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Metric Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: metricCardCount }, (_, index) => {
          const stableKey = `metric-skeleton-${metricCardCount}-${index}`;
          return (
            <Card
              key={stableKey}
              className="overflow-hidden border"
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
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart Section */}
      {showChart && (
        <Card className="overflow-hidden border">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      )}

      {/* Activity List */}
      {showActivity && (
        <Card className="overflow-hidden border">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: activityItemCount }, (_, index) => {
                const stableKey = `activity-skeleton-${activityItemCount}-${index}`;
                return (
                  <div
                    key={stableKey}
                    className="flex items-start gap-4"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
