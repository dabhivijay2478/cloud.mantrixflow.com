/**
 * Data Sources API Service
 * Service layer for data source endpoints (organization-scoped)
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
  DataSource,
  CreateDataSourceDto,
  UpdateDataSourceDto,
} from "../types/data-sources";

export class DataSourcesService {
  // Base path is now organization-scoped
  private static basePath(organizationId: string) {
    return `api/organizations/${organizationId}/data-sources`;
  }

  // ==========================================================================
  // Data Sources CRUD
  // ==========================================================================

  static async listDataSources(organizationId: string): Promise<DataSource[]> {
    return ApiClient.get<DataSource[]>(DataSourcesService.basePath(organizationId));
  }

  static async getDataSource(organizationId: string, id: string): Promise<DataSource> {
    return ApiClient.get<DataSource>(`${DataSourcesService.basePath(organizationId)}/${id}`);
  }

  static async createDataSource(
    organizationId: string,
    dto: CreateDataSourceDto
  ): Promise<DataSource> {
    return ApiClient.post<DataSource>(DataSourcesService.basePath(organizationId), dto);
  }

  static async updateDataSource(
    organizationId: string,
    id: string,
    dto: UpdateDataSourceDto
  ): Promise<DataSource> {
    return ApiClient.put<DataSource>(
      `${DataSourcesService.basePath(organizationId)}/${id}`,
      dto
    );
  }

  static async deleteDataSource(
    organizationId: string,
    id: string
  ): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(
      `${DataSourcesService.basePath(organizationId)}/${id}`
    );
  }

  static async getSupportedTypes(organizationId: string): Promise<string[]> {
    return ApiClient.get<string[]>(`${DataSourcesService.basePath(organizationId)}/types`);
  }

  // ==========================================================================
  // Connection Management (per data source)
  // ==========================================================================

  static async getConnection(
    organizationId: string,
    sourceId: string,
    includeSensitive = false
  ): Promise<Connection> {
    const params = includeSensitive ? "?includeSensitive=true" : "";
    return ApiClient.get<Connection>(
      `${DataSourcesService.basePath(organizationId)}/${sourceId}/connection${params}`
    );
  }

  static async createOrUpdateConnection(
    organizationId: string,
    sourceId: string,
    dto: CreateConnectionDto
  ): Promise<Connection> {
    return ApiClient.post<Connection>(
      `${DataSourcesService.basePath(organizationId)}/${sourceId}/connection`,
      dto
    );
  }

  static async testConnection(
    organizationId: string,
    sourceId: string
  ): Promise<TestConnectionResponse> {
    return ApiClient.post<TestConnectionResponse>(
      `${DataSourcesService.basePath(organizationId)}/${sourceId}/test-connection`
    );
  }

  static async discoverSchema(
    organizationId: string,
    sourceId: string
  ): Promise<{ schemas: Schema[]; tables: Table[] }> {
    return ApiClient.post<{ schemas: Schema[]; tables: Table[] }>(
      `${DataSourcesService.basePath(organizationId)}/${sourceId}/discover-schema`
    );
  }

  // ==========================================================================
  // Legacy Connection Endpoints (for backward compatibility)
  // These are deprecated, use organization-scoped endpoints above
  // ==========================================================================

  private static readonly LEGACY_BASE_PATH = "api/data-sources/postgres";

  /** @deprecated Use organization-scoped endpoints */
  static async testConnectionLegacy(
    data: TestConnectionDto
  ): Promise<TestConnectionResponse> {
    return ApiClient.post<TestConnectionResponse>(
      `${DataSourcesService.LEGACY_BASE_PATH}/test-connection`,
      data
    );
  }

  /** @deprecated Use organization-scoped endpoints */
  static async createConnection(
    data: CreateConnectionDto,
    orgId?: string
  ): Promise<Connection> {
    if (!orgId) {
      throw new Error("Organization ID is required to create a connection");
    }
    const params = `?orgId=${encodeURIComponent(orgId)}`;
    return ApiClient.post<Connection>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections${params}`,
      data
    );
  }

  /** @deprecated Use listDataSources instead */
  static async listConnections(orgId?: string): Promise<Connection[]> {
    // Use the new organization-scoped endpoint if orgId is provided
    if (orgId) {
      try {
        const dataSources = await DataSourcesService.listDataSources(orgId);
        // Map data sources to connection format for backward compatibility
        return dataSources.map(ds => ({
          id: ds.id,
          name: ds.name,
          type: ds.sourceType,
          organizationId: ds.organizationId,
          status: ds.isActive ? "connected" : "disconnected",
          lastConnectedAt: ds.updatedAt,
          createdAt: ds.createdAt,
        } as Connection));
      } catch {
        // Fallback to legacy endpoint if new one fails
        console.warn("Falling back to legacy connections endpoint");
      }
    }
    // Legacy path
    const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : "";
    return ApiClient.get<Connection[]>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections${params}`
    );
  }

  /** @deprecated Use getDataSource instead */
  static async getConnectionLegacy(id: string): Promise<Connection> {
    return ApiClient.get<Connection>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${id}`
    );
  }

  /** @deprecated Use organization-scoped endpoints */
  static async updateConnection(
    id: string,
    data: UpdateConnectionDto
  ): Promise<Connection> {
    return ApiClient.patch<Connection>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${id}`,
      data
    );
  }

  /** @deprecated Use deleteDataSource instead */
  static async deleteConnection(
    id: string,
    orgId?: string
  ): Promise<{ deletedId: string }> {
    let url = `${DataSourcesService.LEGACY_BASE_PATH}/connections/${id}`;
    if (orgId) {
      url += `?orgId=${encodeURIComponent(orgId)}`;
    }
    return ApiClient.delete<{ deletedId: string }>(url);
  }

  // ==========================================================================
  // Schema Discovery
  // ==========================================================================

  static async listDatabases(
    connectionId: string,
    orgId?: string
  ): Promise<Database[]> {
    const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : "";
    return ApiClient.get<Database[]>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/databases${params}`
    );
  }

  static async listSchemas(
    connectionId: string,
    orgId?: string
  ): Promise<Schema[]> {
    const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : "";
    return ApiClient.get<Schema[]>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/schemas${params}`
    );
  }

  static async listSchemasWithTables(
    connectionId: string,
    orgId?: string
  ): Promise<Schema[]> {
    const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : "";
    return ApiClient.get<Schema[]>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/schemas${params}`
    );
  }

  static async listTables(
    connectionId: string,
    schema?: string,
    orgId?: string
  ): Promise<Table[]> {
    const params = new URLSearchParams();
    if (schema) params.append("schema", schema);
    if (orgId) params.append("orgId", orgId);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return ApiClient.get<Table[]>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/tables${queryString}`
    );
  }

  static async getTableSchema(
    connectionId: string,
    table: string,
    schema?: string,
    orgId?: string
  ): Promise<TableSchema> {
    const params = new URLSearchParams();
    if (schema) params.append("schema", schema);
    if (orgId) params.append("orgId", orgId);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return ApiClient.get<TableSchema>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/tables/${table}/schema${queryString}`
    );
  }

  static async refreshSchema(
    connectionId: string
  ): Promise<{ success: boolean }> {
    return ApiClient.post<{ success: boolean }>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/refresh-schema`
    );
  }

  // ==========================================================================
  // Query Execution
  // ==========================================================================

  static async executeQuery(
    connectionId: string,
    data: ExecuteQueryDto,
    orgId?: string
  ): Promise<QueryExecutionResponse> {
    if (!orgId) {
      throw new Error("Organization ID is required to execute a query");
    }
    const params = `?orgId=${encodeURIComponent(orgId)}`;
    return ApiClient.post<QueryExecutionResponse>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/query${params}`,
      data
    );
  }

  static async explainQuery(
    connectionId: string,
    data: ExecuteQueryDto
  ): Promise<ExplainQueryResponse> {
    return ApiClient.post<ExplainQueryResponse>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/query/explain`,
      data
    );
  }

  // ==========================================================================
  // Data Synchronization
  // ==========================================================================

  static async createSyncJob(
    connectionId: string,
    data: CreateSyncJobDto
  ): Promise<SyncJob> {
    return ApiClient.post<SyncJob>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/sync`,
      data
    );
  }

  static async listSyncJobs(connectionId: string): Promise<SyncJob[]> {
    return ApiClient.get<SyncJob[]>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/sync-jobs`
    );
  }

  static async getSyncJob(
    connectionId: string,
    jobId: string
  ): Promise<SyncJob> {
    return ApiClient.get<SyncJob>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/sync-jobs/${jobId}`
    );
  }

  static async cancelSyncJob(
    connectionId: string,
    jobId: string
  ): Promise<{ success: boolean }> {
    return ApiClient.post<{ success: boolean }>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/sync-jobs/${jobId}/cancel`
    );
  }

  static async updateSyncJobSchedule(
    connectionId: string,
    jobId: string,
    data: UpdateSyncJobScheduleDto
  ): Promise<SyncJob> {
    return ApiClient.patch<SyncJob>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/sync-jobs/${jobId}/schedule`,
      data
    );
  }

  // ==========================================================================
  // Monitoring
  // ==========================================================================

  static async getConnectionHealth(
    connectionId: string
  ): Promise<ConnectionHealth> {
    return ApiClient.get<ConnectionHealth>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/health`
    );
  }

  static async getQueryLogs(
    connectionId: string,
    limit?: number,
    offset?: number
  ): Promise<QueryLog[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return ApiClient.get<QueryLog[]>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/query-logs${queryString}`
    );
  }

  static async getConnectionMetrics(
    connectionId: string
  ): Promise<ConnectionMetrics> {
    return ApiClient.get<ConnectionMetrics>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/metrics`
    );
  }
}
