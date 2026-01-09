/**
 * Activity Logs API Service
 * Service layer for activity log endpoints
 */

import { ApiClient } from '../client';
import type { ActivityLog, ActivityLogFilters } from '../types/activity-logs';

export class ActivityLogsService {
  private static readonly BASE_PATH = 'api/activity-logs';

  /**
   * Get activity logs with optional filters and pagination
   */
  static async getActivityLogs(
    filters: ActivityLogFilters,
  ): Promise<ActivityLog[]> {
    const params = new URLSearchParams();
    params.append('organizationId', filters.organizationId);

    if (filters.actionType) {
      params.append('actionType', filters.actionType);
    }
    if (filters.entityType) {
      params.append('entityType', filters.entityType);
    }
    if (filters.entityId) {
      params.append('entityId', filters.entityId);
    }
    if (filters.userId) {
      params.append('userId', filters.userId);
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters.cursor) {
      params.append('cursor', filters.cursor);
    }

    return ApiClient.get<ActivityLog[]>(
      `${ActivityLogsService.BASE_PATH}?${params.toString()}`,
    );
  }
}
