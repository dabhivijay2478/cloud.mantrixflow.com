"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * InlineSkeleton
 * @description Common inline skeleton for loading states, empty placeholders, and transitions.
 * Flexible component for various inline loading scenarios.
 * @param {InlineSkeletonProps} props - Component properties
 * @param {"sm" | "md" | "lg"} [props.size] - Size variant (default: "md")
 * @param {number} [props.count] - Number of skeleton lines (default: 1)
 * @param {boolean} [props.circular] - Use circular shape (default: false)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} InlineSkeleton component
 * @example
 * <InlineSkeleton />
 * <InlineSkeleton size="lg" count={3} />
 * <InlineSkeleton circular size="md" />
 */
export interface InlineSkeletonProps {
  size?: "sm" | "md" | "lg";
  count?: number;
  circular?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-4",
  md: "h-5",
  lg: "h-6",
};

const widthClasses = {
  sm: "w-16",
  md: "w-24",
  lg: "w-32",
};

export function InlineSkeleton({
  size = "md",
  count = 1,
  circular = false,
  className,
}: InlineSkeletonProps) {
  const heightClass = sizeClasses[size];
  const widthClass = widthClasses[size];
  const shapeClass = circular ? "rounded-full" : "rounded-md";

  if (count === 1) {
    return (
      <Skeleton
        className={cn(heightClass, widthClass, shapeClass, className)}
      />
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }, (_, index) => {
        const stableKey = `inline-skeleton-${count}-${index}`;
        return (
          <Skeleton
            key={stableKey}
            className={cn(
              heightClass,
              index === count - 1 ? "w-3/4" : "w-full",
              shapeClass,
            )}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
