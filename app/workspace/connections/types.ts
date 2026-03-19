/**
 * Display model for connection list/drawer.
 * Mapped from API Connection (DataSourcesService.listConnections).
 */
export interface ConnectionDisplay {
  id: string;
  name: string;
  type: string;
  role: "source" | "destination";
  status: "active" | "inactive";
  hostSummary: string;
  pipelineCount: number;
  lastTestResult: "success" | "never" | "failed";
  lastTestTime?: string;
}
