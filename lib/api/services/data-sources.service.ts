/**
 * Data Sources API Service
 * Service layer for PostgreSQL data source endpoints
 */

import { ApiClient } from "../client";
import type {
  Connection,
  ConnectionHealth,
  ConnectionMetrics,
  CreateConnectionDto,
  CreateSyncJobDto,
  Database,
  ExecuteQueryDto,
  ExplainQueryResponse,
  QueryExecutionResponse,
  QueryLog,
  Schema,
  SyncJob,
  Table,
  TableSchema,
  TestConnectionDto,
  TestConnectionResponse,
  UpdateConnectionDto,
  UpdateSyncJobScheduleDto,
} from "../types/data-sources";

export class DataSourcesService {
  private static readonly BASE_PATH = "api/data-sources/postgres";

  // Connection Management
  static async testConnection(
    data: TestConnectionDto,
  ): Promise<TestConnectionResponse> {
    return ApiClient.post<TestConnectionResponse>(
      `${DataSourcesService.BASE_PATH}/test-connection`,
      data,
    );
  }

  static async createConnection(
    data: CreateConnectionDto,
    orgId?: string,
  ): Promise<Connection> {
    if (!orgId) {
      throw new Error("Organization ID is required to create a connection");
    }
    const params = `?orgId=${encodeURIComponent(orgId)}`;
    console.log(
      "[DataSourcesService] Creating connection with URL:",
      `${DataSourcesService.BASE_PATH}/connections${params}`,
    );
    console.log("[DataSourcesService] orgId being sent:", orgId);
    return ApiClient.post<Connection>(
      `${DataSourcesService.BASE_PATH}/connections${params}`,
      data,
    );
  }

  static async listConnections(orgId?: string): Promise<Connection[]> {
    const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : "";
    return ApiClient.get<Connection[]>(
      `${DataSourcesService.BASE_PATH}/connections${params}`,
    );
  }

  static async getConnection(id: string): Promise<Connection> {
    return ApiClient.get<Connection>(
      `${DataSourcesService.BASE_PATH}/connections/${id}`,
    );
  }

  static async updateConnection(
    id: string,
    data: UpdateConnectionDto,
  ): Promise<Connection> {
    return ApiClient.patch<Connection>(
      `${DataSourcesService.BASE_PATH}/connections/${id}`,
      data,
    );
  }

  static async deleteConnection(
    id: string,
    orgId?: string,
  ): Promise<{ deletedId: string }> {
    // Build URL with orgId query parameter if provided
    let url = `${DataSourcesService.BASE_PATH}/connections/${id}`;
    if (orgId) {
      url += `?orgId=${encodeURIComponent(orgId)}`;
    }
    return ApiClient.delete<{ deletedId: string }>(url);
  }

  // Schema Discovery
  static async listDatabases(
    connectionId: string,
    orgId?: string,
  ): Promise<Database[]> {
    const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : "";
    return ApiClient.get<Database[]>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/databases${params}`,
    );
  }

  static async listSchemas(
    connectionId: string,
    orgId?: string,
  ): Promise<Schema[]> {
    const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : "";
    return ApiClient.get<Schema[]>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/schemas${params}`,
    );
  }

  static async listSchemasWithTables(
    connectionId: string,
    orgId?: string,
  ): Promise<Schema[]> {
    const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : "";
    return ApiClient.get<Schema[]>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/schemas${params}`,
    );
  }

  static async listTables(
    connectionId: string,
    schema?: string,
    orgId?: string,
  ): Promise<Table[]> {
    const params = new URLSearchParams();
    if (schema) params.append("schema", schema);
    if (orgId) params.append("orgId", orgId);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return ApiClient.get<Table[]>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/tables${queryString}`,
    );
  }

  static async getTableSchema(
    connectionId: string,
    table: string,
    schema?: string,
    orgId?: string,
  ): Promise<TableSchema> {
    const params = new URLSearchParams();
    if (schema) params.append("schema", schema);
    if (orgId) params.append("orgId", orgId);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return ApiClient.get<TableSchema>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/tables/${table}/schema${queryString}`,
    );
  }

  static async refreshSchema(
    connectionId: string,
  ): Promise<{ success: boolean }> {
    return ApiClient.post<{ success: boolean }>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/refresh-schema`,
    );
  }

  // Query Execution
  static async executeQuery(
    connectionId: string,
    data: ExecuteQueryDto,
    orgId?: string,
  ): Promise<QueryExecutionResponse> {
    if (!orgId) {
      throw new Error("Organization ID is required to execute a query");
    }
    const params = `?orgId=${encodeURIComponent(orgId)}`;
    return ApiClient.post<QueryExecutionResponse>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/query${params}`,
      data,
    );
  }

  static async explainQuery(
    connectionId: string,
    data: ExecuteQueryDto,
  ): Promise<ExplainQueryResponse> {
    return ApiClient.post<ExplainQueryResponse>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/query/explain`,
      data,
    );
  }

  // Data Synchronization
  static async createSyncJob(
    connectionId: string,
    data: CreateSyncJobDto,
  ): Promise<SyncJob> {
    return ApiClient.post<SyncJob>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/sync`,
      data,
    );
  }

  static async listSyncJobs(connectionId: string): Promise<SyncJob[]> {
    return ApiClient.get<SyncJob[]>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/sync-jobs`,
    );
  }

  static async getSyncJob(
    connectionId: string,
    jobId: string,
  ): Promise<SyncJob> {
    return ApiClient.get<SyncJob>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/sync-jobs/${jobId}`,
    );
  }

  static async cancelSyncJob(
    connectionId: string,
    jobId: string,
  ): Promise<{ success: boolean }> {
    return ApiClient.post<{ success: boolean }>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/sync-jobs/${jobId}/cancel`,
    );
  }

  static async updateSyncJobSchedule(
    connectionId: string,
    jobId: string,
    data: UpdateSyncJobScheduleDto,
  ): Promise<SyncJob> {
    return ApiClient.patch<SyncJob>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/sync-jobs/${jobId}/schedule`,
      data,
    );
  }

  // Monitoring
  static async getConnectionHealth(
    connectionId: string,
  ): Promise<ConnectionHealth> {
    return ApiClient.get<ConnectionHealth>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/health`,
    );
  }

  static async getQueryLogs(
    connectionId: string,
    limit?: number,
    offset?: number,
  ): Promise<QueryLog[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return ApiClient.get<QueryLog[]>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/query-logs${queryString}`,
    );
  }

  static async getConnectionMetrics(
    connectionId: string,
  ): Promise<ConnectionMetrics> {
    return ApiClient.get<ConnectionMetrics>(
      `${DataSourcesService.BASE_PATH}/connections/${connectionId}/metrics`,
    );
  }
}
