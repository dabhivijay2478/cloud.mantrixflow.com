/**
 * Dashboard API Service
 * Service layer for dashboard endpoints
 */

import { ApiClient } from "../client";
import type { DashboardOverview } from "../types/dashboard";

export class DashboardService {
  private static readonly BASE_PATH = "api/dashboard";

  /**
   * Get dashboard overview for an organization
   * Note: ApiClient.get already extracts data.data, so we get DashboardOverview directly
   */
  static async getDashboardOverview(
    organizationId: string,
  ): Promise<DashboardOverview> {
    const params = new URLSearchParams();
    params.append("organizationId", organizationId);

    // ApiClient.get extracts data.data automatically, so we get DashboardOverview directly
    const overview = await ApiClient.get<DashboardOverview>(
      `${DashboardService.BASE_PATH}/overview?${params.toString()}`,
    );

    return overview;
  }
}
