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
  CreateDataSourceDto,
  CreateSyncJobDto,
  Database,
  DataSource,
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
  UpdateDataSourceDto,
  UpdateSyncJobScheduleDto,
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
    return ApiClient.get<DataSource[]>(
      DataSourcesService.basePath(organizationId),
    );
  }

  static async getDataSource(
    organizationId: string,
    id: string,
  ): Promise<DataSource> {
    return ApiClient.get<DataSource>(
      `${DataSourcesService.basePath(organizationId)}/${id}`,
    );
  }

  static async createDataSource(
    organizationId: string,
    dto: CreateDataSourceDto,
  ): Promise<DataSource> {
    // Explicitly map frontend DTO (snake_case) to backend DTO (camelCase)
    const payload = {
      name: dto.name,
      description: dto.description,
      sourceType: dto.source_type,
      metadata: dto.metadata,
    };
    return ApiClient.post<DataSource>(
      DataSourcesService.basePath(organizationId),
      payload,
    );
  }

  static async updateDataSource(
    organizationId: string,
    id: string,
    dto: UpdateDataSourceDto,
  ): Promise<DataSource> {
    return ApiClient.put<DataSource>(
      `${DataSourcesService.basePath(organizationId)}/${id}`,
      dto,
    );
  }

  static async deleteDataSource(
    organizationId: string,
    id: string,
  ): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(
      `${DataSourcesService.basePath(organizationId)}/${id}`,
    );
  }

  static async getSupportedTypes(organizationId: string): Promise<string[]> {
    return ApiClient.get<string[]>(
      `${DataSourcesService.basePath(organizationId)}/types`,
    );
  }

  // ==========================================================================
  // Connection Management (per data source)
  // ==========================================================================

  static async getConnection(
    organizationId: string,
    sourceId: string,
    includeSensitive = false,
  ): Promise<Connection> {
    const params = includeSensitive ? "?includeSensitive=true" : "";
    return ApiClient.get<Connection>(
      `${DataSourcesService.basePath(organizationId)}/${sourceId}/connection${params}`,
    );
  }

  static async createOrUpdateConnection(
    organizationId: string,
    sourceId: string,
    dto: CreateConnectionDto,
  ): Promise<Connection> {
    return ApiClient.post<Connection>(
      `${DataSourcesService.basePath(organizationId)}/${sourceId}/connection`,
      {
        connectionType: dto.connection_type,
        config: dto.config,
      },
    );
  }

  static async testConnection(
    organizationId: string,
    sourceId: string,
  ): Promise<TestConnectionResponse> {
    return ApiClient.post<TestConnectionResponse>(
      `${DataSourcesService.basePath(organizationId)}/${sourceId}/test-connection`,
    );
  }

  static async discoverSchema(
    organizationId: string,
    sourceId: string,
  ): Promise<{ schemas: Schema[]; tables: Table[] }> {
    return ApiClient.post<{ schemas: Schema[]; tables: Table[] }>(
      `${DataSourcesService.basePath(organizationId)}/${sourceId}/discover-schema`,
    );
  }

  // ==========================================================================
  // Legacy Connection Endpoints (for backward compatibility)
  // These are deprecated, use organization-scoped endpoints above
  // ==========================================================================

  private static readonly LEGACY_BASE_PATH = "api/data-sources/postgres";

  /** @deprecated Use organization-scoped endpoints */
  /** @deprecated Use organization-scoped endpoints */
  static async testConnectionLegacy(
    organizationId: string,
    data: TestConnectionDto,
  ): Promise<TestConnectionResponse> {
    return ApiClient.post<TestConnectionResponse>(
      `${DataSourcesService.basePath(organizationId)}/test-connection`,
      data,
    );
  }

  /** @deprecated Use organization-scoped endpoints */
  static async createConnection(
    data: CreateConnectionDto,
    orgId?: string,
  ): Promise<Connection> {
    if (!orgId) {
      throw new Error("Organization ID is required to create a connection");
    }

    // 1. Create Data Source
    const dataSource = await DataSourcesService.createDataSource(orgId, {
      name: data.name,
      source_type: data.connection_type,
      description: `Connection for ${data.name || data.connection_type}`,
    });

    // 2. Configure Connection
    // Map snake_case from frontend DTO to camelCase for backend if needed
    // or pass as is if backend controller uses same DTO
    const connectionResult = await DataSourcesService.createOrUpdateConnection(
      orgId,
      dataSource.id,
      {
        ...data,
      } as CreateConnectionDto,
    );

    // biome-ignore lint/suspicious/noExplicitAny: Legacy code
    const connection = connectionResult as any; // Cast to access properties not in Connection interface

    // 3. Return combined object matching Connection interface
    // Note: Frontend uses DataSource ID as Connection ID in listings
    return {
      id: dataSource.id,
      organizationId: dataSource.organizationId,
      name: dataSource.name,
      type: dataSource.sourceType,
      status: connection.status,
      // map other fields
      created_at: dataSource.createdAt,
      createdAt: dataSource.createdAt,
      updated_at: dataSource.updatedAt,
      updatedAt: dataSource.updatedAt,

      connection_type: connection.connection_type,

      config: connection.config,
    } as unknown as Connection;
  }

  /** @deprecated Use listDataSources instead */
  static async listConnections(orgId?: string): Promise<Connection[]> {
    // Use the new organization-scoped endpoint if orgId is provided
    if (orgId) {
      try {
        const dataSources = await DataSourcesService.listDataSources(orgId);
        // Map data sources to connection format for backward compatibility
        return dataSources.map(
          (ds) =>
            ({
              id: ds.id,
              name: ds.name,
              type: ds.sourceType,
              organizationId: ds.organizationId,
              status: ds.isActive ? "connected" : "disconnected",
              lastConnectedAt: ds.updatedAt,
              createdAt: ds.createdAt,
            }) as Connection,
        );
      } catch {
        // Fallback to legacy endpoint if new one fails
        console.warn("Falling back to legacy connections endpoint");
      }
    }
    // Legacy path
    const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : "";
    return ApiClient.get<Connection[]>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections${params}`,
    );
  }

  /** @deprecated Use getDataSource instead */
  static async getConnectionLegacy(id: string): Promise<Connection> {
    return ApiClient.get<Connection>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${id}`,
    );
  }

  /** @deprecated Use organization-scoped endpoints */
  static async updateConnection(
    id: string,
    data: UpdateConnectionDto,
  ): Promise<Connection> {
    return ApiClient.patch<Connection>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${id}`,
      data,
    );
  }

  /** @deprecated Use deleteDataSource instead */
  static async deleteConnection(
    id: string,
    orgId?: string,
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
    orgId?: string,
  ): Promise<Database[]> {
    const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : "";
    return ApiClient.get<Database[]>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/databases${params}`,
    );
  }

  static async listSchemas(
    connectionId: string,
    orgId?: string,
  ): Promise<Schema[]> {
    if (!orgId) throw new Error("Organization ID is required");
    const result = await DataSourcesService.discoverSchema(orgId, connectionId);
    return result.schemas || [];
  }

  static async listSchemasWithTables(
    connectionId: string,
    orgId?: string,
  ): Promise<Schema[]> {
    if (!orgId) throw new Error("Organization ID is required");
    const result = await DataSourcesService.discoverSchema(orgId, connectionId);
    return result.schemas || [];
  }

  static async listTables(
    connectionId: string,
    schema?: string,
    orgId?: string,
  ): Promise<Table[]> {
    if (!orgId) throw new Error("Organization ID is required");
    const result = await DataSourcesService.discoverSchema(orgId, connectionId);

    if (schema) {
      // biome-ignore lint/suspicious/noExplicitAny: Legacy code
      const foundSchema = result.schemas?.find((s: any) => s.name === schema);
      return foundSchema ? foundSchema.tables || [] : [];
    }

    // If no schema specified, flatten all tables? Or return empty?
    // Legacy behavior was listing tables for a schema.
    // biome-ignore lint/suspicious/noExplicitAny: Legacy code
    return result.schemas?.flatMap((s: any) => s.tables) || [];
  }

  static async getTableSchema(
    connectionId: string,
    table: string,
    schema?: string,
    orgId?: string,
  ): Promise<TableSchema> {
    if (!orgId) throw new Error("Organization ID is required");

    // Use discoverSchema to get full schema info including columns
    const result = await DataSourcesService.discoverSchema(orgId, connectionId);

    let targetTable: Table | undefined;

    if (schema) {
      const foundSchema = result.schemas?.find(
        (s: Schema) => s.name === schema,
      );
      targetTable = foundSchema?.tables?.find((t: Table) => t.name === table);
    } else {
      // If no schema specified, search all schemas (or default to public)
      for (const s of result.schemas || []) {
        targetTable = s.tables?.find((t: Table) => t.name === table);
        if (targetTable) break;
      }
    }

    if (!targetTable) {
      return {
        columns: [],
        table: table,
        schema: schema || "unknown",
        primaryKeys: [],
      };
    }

    // Note: discoverSchema doesn't return column details, only table metadata
    // TODO: Implement proper endpoint to fetch table schema with columns
    return {
      columns: [], // Columns not available from discoverSchema result
      table: targetTable.name,
      schema: targetTable.schema || schema || "public",
      primaryKeys: [], // TODO: Fetch primary keys
    };
  }

  static async refreshSchema(
    connectionId: string,
  ): Promise<{ success: boolean }> {
    return ApiClient.post<{ success: boolean }>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/refresh-schema`,
    );
  }

  // ==========================================================================
  // Query Execution
  // ==========================================================================

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
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/query${params}`,
      data,
    );
  }

  static async explainQuery(
    connectionId: string,
    data: ExecuteQueryDto,
  ): Promise<ExplainQueryResponse> {
    return ApiClient.post<ExplainQueryResponse>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/query/explain`,
      data,
    );
  }

  // ==========================================================================
  // Data Synchronization
  // ==========================================================================

  static async createSyncJob(
    connectionId: string,
    data: CreateSyncJobDto,
  ): Promise<SyncJob> {
    return ApiClient.post<SyncJob>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/sync`,
      data,
    );
  }

  static async listSyncJobs(connectionId: string): Promise<SyncJob[]> {
    return ApiClient.get<SyncJob[]>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/sync-jobs`,
    );
  }

  static async getSyncJob(
    connectionId: string,
    jobId: string,
  ): Promise<SyncJob> {
    return ApiClient.get<SyncJob>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/sync-jobs/${jobId}`,
    );
  }

  static async cancelSyncJob(
    connectionId: string,
    jobId: string,
  ): Promise<{ success: boolean }> {
    return ApiClient.post<{ success: boolean }>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/sync-jobs/${jobId}/cancel`,
    );
  }

  static async updateSyncJobSchedule(
    connectionId: string,
    jobId: string,
    data: UpdateSyncJobScheduleDto,
  ): Promise<SyncJob> {
    return ApiClient.patch<SyncJob>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/sync-jobs/${jobId}/schedule`,
      data,
    );
  }

  // ==========================================================================
  // Monitoring
  // ==========================================================================

  static async getConnectionHealth(
    connectionId: string,
  ): Promise<ConnectionHealth> {
    return ApiClient.get<ConnectionHealth>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/health`,
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
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/query-logs${queryString}`,
    );
  }

  static async getConnectionMetrics(
    connectionId: string,
  ): Promise<ConnectionMetrics> {
    return ApiClient.get<ConnectionMetrics>(
      `${DataSourcesService.LEGACY_BASE_PATH}/connections/${connectionId}/metrics`,
    );
  }
}
