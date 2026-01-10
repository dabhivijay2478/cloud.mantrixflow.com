/**
 * Dashboard API Types
 * Type definitions for dashboard endpoints
 */

export interface DashboardOverview {
  organization: {
    id: string;
    name: string;
    memberCount: number;
    createdAt: string | Date;
  };
  pipelines: {
    total: number;
    active: number;
    paused: number;
    failed: number;
    byStatus: {
      running: number;
      completed: number;
      failed: number;
      pending: number;
    };
  };
  recentMigrations: Array<{
    id: string;
    pipelineId: string;
    pipelineName: string;
    status: string;
    startedAt: string | Date | null;
    completedAt: string | Date | null;
    rowsProcessed: number | null;
  }>;
  recentActivity: Array<{
    id: string;
    actionType: string;
    entityType: string;
    message: string;
    createdAt: string | Date;
    userId: string | null;
  }>;
}

export interface DashboardResponse {
  data: DashboardOverview;
  meta: {
    message: string;
  };
}
