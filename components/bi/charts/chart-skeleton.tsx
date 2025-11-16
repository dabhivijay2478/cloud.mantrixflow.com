"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * ChartSkeleton
 * @description Skeleton loader for chart components with optional title/description.
 * @param {ChartSkeletonProps} props - Component properties
 * @param {string} [props.title] - Chart title (shows skeleton if provided)
 * @param {string} [props.description] - Chart description (shows skeleton if provided)
 * @param {string} [props.className] - Additional CSS classes
 * @param {"line" | "bar" | "pie"} [props.type] - Chart type for shape (default: "line")
 * @returns {JSX.Element} ChartSkeleton component
 */
export interface ChartSkeletonProps {
  title?: string;
  description?: string;
  className?: string;
  type?: "line" | "bar" | "pie";
}

export function ChartSkeleton({
  title,
  description,
  className,
  type = "line",
}: ChartSkeletonProps) {
  return (
    <Card className={cn("h-full flex flex-col border", className)}>
      {(title || description) && (
        <CardHeader className="flex-shrink-0 pb-4">
          {title && <Skeleton className="h-6 w-48" />}
          {description && <Skeleton className="h-4 w-64 mt-2" />}
        </CardHeader>
      )}
      <CardContent className="flex-1 min-h-0 pt-0">
        {type === "pie" ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="h-64 w-64 rounded-full" />
          </div>
        ) : (
          <div className="h-full space-y-3">
            {/* Chart area skeleton */}
            <div className="h-[calc(100%-2rem)] space-y-2">
              {type === "bar" ? (
                // Bar chart skeleton
                <div className="h-full flex items-end justify-between gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="w-full"
                      style={{
                        height: `${Math.random() * 60 + 20}%`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                // Line chart skeleton
                <div className="h-full flex flex-col justify-end space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="w-full"
                      style={{
                        height: `${Math.random() * 30 + 10}%`,
                        animationDelay: `${i * 80}ms`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            {/* Axis labels skeleton */}
            <div className="flex justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

