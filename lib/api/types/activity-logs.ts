/**
 * Activity Log Types
 * TypeScript types for activity log API responses
 */

export interface ActivityLog {
  id: string;
  organizationId: string;
  userId: string | null;
  actionType: string;
  entityType: string;
  entityId: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ActivityLogFilters {
  organizationId: string;
  actionType?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  limit?: number;
  cursor?: string;
}

export interface ActivityLogResponse {
  data: ActivityLog[];
  meta: {
    statusCode: number;
    message: string;
    status: "success" | "error" | "warning";
    timestamp: string;
  };
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    nextCursor?: string | null; // Cursor for next page
  };
}
