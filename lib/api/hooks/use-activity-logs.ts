/**
 * Activity Logs TanStack Query Hooks
 * Reusable hooks for activity log API endpoints
 */

import { useQuery } from "@tanstack/react-query";
import { ActivityLogsService } from "../services/activity-logs.service";
import type { ActivityLogFilters } from "../types/activity-logs";

// Query Keys
export const activityLogsKeys = {
  all: ["activity-logs"] as const,
  lists: () => [...activityLogsKeys.all, "list"] as const,
  list: (filters: ActivityLogFilters) =>
    [...activityLogsKeys.lists(), filters] as const,
};

/**
 * Get activity logs with filters and pagination
 */
export function useActivityLogs(
  filters: ActivityLogFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: activityLogsKeys.list(filters),
    queryFn: () => ActivityLogsService.getActivityLogs(filters),
    enabled: (options?.enabled ?? true) && !!filters.organizationId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 1, // Only retry once on failure
  });
}
