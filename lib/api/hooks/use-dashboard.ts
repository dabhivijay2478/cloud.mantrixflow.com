/**
 * Dashboard TanStack Query Hooks
 * Reusable hooks for dashboard API endpoints
 */

import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "../services/dashboard.service";

// Query Keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: (organizationId: string) =>
    [...dashboardKeys.all, "overview", organizationId] as const,
};

/**
 * Get dashboard overview
 */
export function useDashboardOverview(organizationId: string | undefined) {
  return useQuery({
    queryKey: dashboardKeys.overview(organizationId || ""),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      const result =
        await DashboardService.getDashboardOverview(organizationId);
      if (!result) {
        throw new Error("Dashboard data is undefined");
      }
      return result;
    },
    enabled: !!organizationId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
