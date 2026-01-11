"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * AppHeaderSkeleton
 * @description Skeleton loader for app header/organization switcher during initial load.
 * Used for organization context loading and global header.
 * @param {AppHeaderSkeletonProps} props - Component properties
 * @param {boolean} [props.showSidebar] - Show sidebar navigation items (default: false)
 * @param {number} [props.sidebarItemCount] - Number of sidebar items (default: 5)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} AppHeaderSkeleton component
 * @example
 * <AppHeaderSkeleton />
 * <AppHeaderSkeleton showSidebar sidebarItemCount={6} />
 */
export interface AppHeaderSkeletonProps {
  showSidebar?: boolean;
  sidebarItemCount?: number;
  className?: string;
}

export function AppHeaderSkeleton({
  showSidebar = false,
  sidebarItemCount = 5,
  className,
}: AppHeaderSkeletonProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Organization Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
        <div className="min-w-0 flex-1 space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Sidebar Navigation Items */}
      {showSidebar && (
        <div className="hidden md:flex items-center gap-2">
          {Array.from({ length: sidebarItemCount }, (_, index) => {
            // Generate stable key using component instance and index
            const stableKey = `nav-skeleton-${sidebarItemCount}-${index}`;
            return (
              <Skeleton
                key={stableKey}
                className="h-9 w-20"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* User Avatar */}
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}
