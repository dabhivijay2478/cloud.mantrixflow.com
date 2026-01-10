/**
 * Activity Logs API Service
 * Service layer for activity log endpoints
 */

import { createFetchOptions, getApiUrl } from "../config";
import type {
  ActivityLogFilters,
  ActivityLogResponse,
} from "../types/activity-logs";

export class ActivityLogsService {
  private static readonly BASE_PATH = "api/activity-logs";

  /**
   * Get activity logs with optional filters and pagination
   * Returns the full response including pagination metadata
   * Note: We fetch directly to get the full response with pagination
   * since the API client extracts data.data for standard responses
   */
  static async getActivityLogs(
    filters: ActivityLogFilters,
  ): Promise<ActivityLogResponse> {
    const params = new URLSearchParams();
    params.append("organizationId", filters.organizationId);

    if (filters.actionType) {
      params.append("actionType", filters.actionType);
    }
    if (filters.entityType) {
      params.append("entityType", filters.entityType);
    }
    if (filters.entityId) {
      params.append("entityId", filters.entityId);
    }
    if (filters.userId) {
      params.append("userId", filters.userId);
    }
    if (filters.limit) {
      params.append("limit", filters.limit.toString());
    }
    if (filters.cursor) {
      params.append("cursor", filters.cursor);
    }

    // Fetch directly to get full response with pagination
    const url = getApiUrl(
      `${ActivityLogsService.BASE_PATH}?${params.toString()}`,
    );
    const fetchOptions = await createFetchOptions({
      method: "GET",
    });

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          errorData.meta?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return response.json() as Promise<ActivityLogResponse>;
  }
}
