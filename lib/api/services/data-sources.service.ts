/**
 * Data Sources API Service
 * Service layer for PostgreSQL data source endpoints
 */

import { ApiClient } from '../client';
import type {
  TestConnectionDto,
  TestConnectionResponse,
  CreateConnectionDto,
  UpdateConnectionDto,
  Connection,
  Database,
  Schema,
  Table,
  TableSchema,
  ExecuteQueryDto,
  QueryExecutionResponse,
  ExplainQueryResponse,
  CreateSyncJobDto,
  SyncJob,
  UpdateSyncJobScheduleDto,
  ConnectionHealth,
  QueryLog,
  ConnectionMetrics,
} from '../types/data-sources';

export class DataSourcesService {
  private static readonly BASE_PATH = 'api/data-sources/postgres';

  // Connection Management
  static async testConnection(
    data: TestConnectionDto,
  ): Promise<TestConnectionResponse> {
    return ApiClient.post<TestConnectionResponse>(
      `${this.BASE_PATH}/test-connection`,
      data,
    );
  }

  static async createConnection(
    data: CreateConnectionDto,
  ): Promise<Connection> {
    return ApiClient.post<Connection>(`${this.BASE_PATH}/connections`, data);
  }

  static async listConnections(): Promise<Connection[]> {
    return ApiClient.get<Connection[]>(`${this.BASE_PATH}/connections`);
  }

  static async getConnection(id: string): Promise<Connection> {
    return ApiClient.get<Connection>(`${this.BASE_PATH}/connections/${id}`);
  }

  static async updateConnection(
    id: string,
    data: UpdateConnectionDto,
  ): Promise<Connection> {
    return ApiClient.patch<Connection>(
      `${this.BASE_PATH}/connections/${id}`,
      data,
    );
  }

  static async deleteConnection(id: string): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(
      `${this.BASE_PATH}/connections/${id}`,
    );
  }

  // Schema Discovery
  static async listDatabases(connectionId: string): Promise<Database[]> {
    return ApiClient.get<Database[]>(
      `${this.BASE_PATH}/connections/${connectionId}/databases`,
    );
  }

  static async listSchemas(connectionId: string): Promise<Schema[]> {
    return ApiClient.get<Schema[]>(
      `${this.BASE_PATH}/connections/${connectionId}/schemas`,
    );
  }

  static async listTables(
    connectionId: string,
    schema?: string,
  ): Promise<Table[]> {
    const params = schema ? `?schema=${encodeURIComponent(schema)}` : '';
    return ApiClient.get<Table[]>(
      `${this.BASE_PATH}/connections/${connectionId}/tables${params}`,
    );
  }

  static async getTableSchema(
    connectionId: string,
    table: string,
    schema?: string,
  ): Promise<TableSchema> {
    const params = schema ? `?schema=${encodeURIComponent(schema)}` : '';
    return ApiClient.get<TableSchema>(
      `${this.BASE_PATH}/connections/${connectionId}/tables/${table}/schema${params}`,
    );
  }

  static async refreshSchema(connectionId: string): Promise<{ success: boolean }> {
    return ApiClient.post<{ success: boolean }>(
      `${this.BASE_PATH}/connections/${connectionId}/refresh-schema`,
    );
  }

  // Query Execution
  static async executeQuery(
    connectionId: string,
    data: ExecuteQueryDto,
  ): Promise<QueryExecutionResponse> {
    return ApiClient.post<QueryExecutionResponse>(
      `${this.BASE_PATH}/connections/${connectionId}/query`,
      data,
    );
  }

  static async explainQuery(
    connectionId: string,
    data: ExecuteQueryDto,
  ): Promise<ExplainQueryResponse> {
    return ApiClient.post<ExplainQueryResponse>(
      `${this.BASE_PATH}/connections/${connectionId}/query/explain`,
      data,
    );
  }

  // Data Synchronization
  static async createSyncJob(
    connectionId: string,
    data: CreateSyncJobDto,
  ): Promise<SyncJob> {
    return ApiClient.post<SyncJob>(
      `${this.BASE_PATH}/connections/${connectionId}/sync`,
      data,
    );
  }

  static async listSyncJobs(connectionId: string): Promise<SyncJob[]> {
    return ApiClient.get<SyncJob[]>(
      `${this.BASE_PATH}/connections/${connectionId}/sync-jobs`,
    );
  }

  static async getSyncJob(
    connectionId: string,
    jobId: string,
  ): Promise<SyncJob> {
    return ApiClient.get<SyncJob>(
      `${this.BASE_PATH}/connections/${connectionId}/sync-jobs/${jobId}`,
    );
  }

  static async cancelSyncJob(
    connectionId: string,
    jobId: string,
  ): Promise<{ success: boolean }> {
    return ApiClient.post<{ success: boolean }>(
      `${this.BASE_PATH}/connections/${connectionId}/sync-jobs/${jobId}/cancel`,
    );
  }

  static async updateSyncJobSchedule(
    connectionId: string,
    jobId: string,
    data: UpdateSyncJobScheduleDto,
  ): Promise<SyncJob> {
    return ApiClient.patch<SyncJob>(
      `${this.BASE_PATH}/connections/${connectionId}/sync-jobs/${jobId}/schedule`,
      data,
    );
  }

  // Monitoring
  static async getConnectionHealth(
    connectionId: string,
  ): Promise<ConnectionHealth> {
    return ApiClient.get<ConnectionHealth>(
      `${this.BASE_PATH}/connections/${connectionId}/health`,
    );
  }

  static async getQueryLogs(
    connectionId: string,
    limit?: number,
    offset?: number,
  ): Promise<QueryLog[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get<QueryLog[]>(
      `${this.BASE_PATH}/connections/${connectionId}/query-logs${queryString}`,
    );
  }

  static async getConnectionMetrics(
    connectionId: string,
  ): Promise<ConnectionMetrics> {
    return ApiClient.get<ConnectionMetrics>(
      `${this.BASE_PATH}/connections/${connectionId}/metrics`,
    );
  }
}
