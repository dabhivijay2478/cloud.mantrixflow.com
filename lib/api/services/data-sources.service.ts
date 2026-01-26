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
  DataSourceType,
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
    // Call Python API directly for creation
    const { PythonETLService } = await import("./python-etl.service");

    console.log(
      "[DataSourcesService] Creating data source via Python service",
      {
        organizationId,
        name: dto.name,
        source_type: dto.source_type,
      },
    );

    const result = await PythonETLService.createDataSource(organizationId, {
      name: dto.name,
      description: dto.description,
      source_type: dto.source_type,
      metadata: dto.metadata,
    });

    // Map Python response (snake_case) to frontend format (camelCase)
    return {
      id: result.id,
      organizationId: result.organization_id,
      name: result.name,
      description: result.description,
      sourceType: result.source_type,
      isActive: result.is_active,
      metadata: result.metadata,
      createdBy: result.created_by,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      deletedAt: undefined,
    } as unknown as DataSource;
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

  /**
   * Delete data source - calls NestJS API directly
   * NestJS handles data source deletion
   */
  static async deleteDataSource(
    organizationId: string,
    id: string,
  ): Promise<{ deletedId: string }> {
    // Call NestJS API directly for deletion
    const response = await ApiClient.delete<{
      deletedId: string;
      meta: Record<string, unknown>;
    }>(`${DataSourcesService.basePath(organizationId)}/${id}`);
    return { deletedId: response.deletedId || id };
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
    // Call Python API directly to fetch from Supabase
    const { PythonETLService } = await import("./python-etl.service");
    const connection = await PythonETLService.getConnection(
      organizationId,
      sourceId,
      includeSensitive,
    );

    if (!connection) {
      throw new Error("Connection not found for this data source");
    }

    // Get data source to get name
    const dataSource = await DataSourcesService.getDataSource(
      organizationId,
      sourceId,
    );

    // Map Python API response to Connection format
    return {
      id: connection.id,
      organizationId,
      name: dataSource.name,
      type: connection.connection_type as DataSourceType,
      status: connection.status as "active" | "inactive" | "error" | "testing",
      config: connection.config,
      created_at: connection.created_at,
      createdAt: connection.created_at,
      updated_at: connection.updated_at,
      updatedAt: connection.updated_at,
    } as Connection & { config: Record<string, unknown> };
  }

  /**
   * Create or update connection for a data source - calls Python API directly
   * Python handles validation and creates/updates the connection in Supabase
   */
  static async createOrUpdateConnection(
    organizationId: string,
    sourceId: string,
    dto: CreateConnectionDto,
  ): Promise<Connection> {
    // Call Python API directly for creation/update
    const { PythonETLService } = await import("./python-etl.service");

    console.log(
      "[DataSourcesService] Creating/updating connection via Python service",
      {
        organizationId,
        sourceId,
        connection_type: dto.connection_type,
      },
    );

    const result = await PythonETLService.createOrUpdateConnection(
      organizationId,
      sourceId,
      {
        connection_type: dto.connection_type,
        config: dto.config as unknown as Record<string, unknown>,
      },
    );

    // Map Python response to Connection format
    return {
      id: result.id,
      organizationId,
      name: dto.name, // Name comes from DTO, not from Python response
      type: result.connection_type,
      status: result.status,
      config: result.config,
      created_at: result.created_at,
      createdAt: result.created_at,
      updated_at: result.updated_at,
      updatedAt: result.updated_at,
    } as Connection;
  }

  static async testConnection(
    _organizationId: string,
    _sourceId: string,
  ): Promise<TestConnectionResponse> {
    // This endpoint tests an existing connection by data source ID
    // For now, we'll need to get the connection config first, then test it
    // TODO: Implement fetching connection config and testing it via Python API
    throw new Error(
      "Test connection by source ID not yet implemented. Use testConnectionLegacy with connection config instead.",
    );
  }

  /**
   * Discover schema for a data source - calls Python API directly
   * Python handles schema discovery for all data source types
   */
  static async discoverSchema(
    organizationId: string,
    sourceId: string,
    options?: {
      tableName?: string;
      schemaName?: string;
      query?: string;
    },
  ): Promise<{
    schemas?: Schema[];
    tables?: Table[];
    databases?: Array<{
      name: string;
      collections?: Array<{ name: string; type?: string }>;
    }>;
    type?: string;
  }> {
    // Get connection config first
    const connection = await DataSourcesService.getConnection(
      organizationId,
      sourceId,
      true,
    );

    const connectionWithConfig = connection as Connection & {
      config: Record<string, unknown>;
    };
    if (!connection || !connectionWithConfig.config) {
      throw new Error("Connection not configured for this data source");
    }

    // Get data source to determine source type
    const dataSource = await DataSourcesService.getDataSource(
      organizationId,
      sourceId,
    );
    const sourceType =
      dataSource.sourceType?.toLowerCase() === "postgres"
        ? "postgresql"
        : dataSource.sourceType?.toLowerCase() || "postgresql";

    // Call Python service directly for schema discovery
    const { PythonETLService } = await import("./python-etl.service");

    const discovered = await PythonETLService.discoverSchema(sourceType, {
      source_type: sourceType,
      connection_config: connectionWithConfig.config as Record<string, unknown>,
      source_config: {},
      table_name: options?.tableName,
      schema_name: options?.schemaName,
      query: options?.query,
    });

    // Map Python response to expected format
    // The response format depends on the source type
    if (sourceType === "mongodb") {
      // MongoDB returns databases and collections
      return {
        databases: discovered.columns as Array<{
          name: string;
          collections?: Array<{ name: string; type?: string }>;
        }>, // MongoDB uses columns field for collections
        type: "mongodb",
      };
    } else {
      // SQL databases return tables
      return {
        tables: discovered.columns.map((col) => ({
          name: col.name,
          schema: options?.schemaName || "public",
          type: col.type,
          columns: [col],
        })) as Table[],
        schemas: options?.schemaName
          ? [{ name: options.schemaName }]
          : undefined,
        type: sourceType,
      };
    }
  }

  // ==========================================================================
  // Legacy Connection Endpoints (for backward compatibility)
  // These are deprecated, use organization-scoped endpoints above
  // ==========================================================================

  private static readonly LEGACY_BASE_PATH = "api/data-sources/postgres";

  /** @deprecated Use organization-scoped endpoints */
  /**
   * Test connection - calls Python API directly
   * Python handles connection testing for all data source types
   */
  /**
   * Test connection - calls Python API directly
   * Frontend should use this method for testing connections
   */
  static async testConnectionLegacy(
    _organizationId: string,
    data: TestConnectionDto,
  ): Promise<TestConnectionResponse> {
    // Call Python API directly for connection testing
    const { PythonETLService } = await import("./python-etl.service");

    const result = await PythonETLService.testConnection({
      ...data,
      type: data.type || "postgres",
      ssl: data.ssl ?? undefined,
      sshTunnel: data.sshTunnel ?? undefined,
    } as Parameters<typeof PythonETLService.testConnection>[0]);

    return {
      success: result.success,
      error: result.error,
      version: result.version,
      responseTimeMs: result.response_time_ms,
    };
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

    const connection = connectionResult as Connection & {
      config: Record<string, unknown>;
    }; // Cast to access properties not in Connection interface

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

      connection_type: connection.type || dataSource.sourceType,

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
  /**
   * Delete connection - calls Python API directly
   * Python handles validation and calls NestJS for actual database deletion
   */
  static async deleteConnection(
    id: string,
    orgId?: string,
  ): Promise<{ deletedId: string }> {
    if (!orgId) {
      throw new Error("Organization ID is required to delete connection");
    }

    // Call Python API directly for deletion
    const { PythonETLService } = await import("./python-etl.service");

    // For legacy API, connection ID is the same as data source ID
    const result = await PythonETLService.deleteConnection(orgId, id, id);
    return { deletedId: result.deleted_id || id };
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

    // SQL databases return schemas
    if (result.schemas) {
      return result.schemas;
    }

    // MongoDB returns databases - convert to schema format
    if (result.databases) {
      return result.databases.map((db) => ({
        name: db.name,
        tables: (db.collections || []).map((coll) => ({
          name: coll.name,
          schema: db.name,
          type: (coll.type || "table") as "table" | "view" | "materialized_view",
        })),
      }));
    }

    return [];
  }

  static async listSchemasWithTables(
    connectionId: string,
    orgId?: string,
  ): Promise<Schema[]> {
    if (!orgId) throw new Error("Organization ID is required");

    // Call Python API directly to get schemas and tables
    const { PythonETLService } = await import("./python-etl.service");
    const result = await PythonETLService.listSchemasWithTables(
      orgId,
      connectionId,
    );

    // Map Python API response to Schema[] format
    if (result.schemas && result.schemas.length > 0) {
      return result.schemas.map((schema) => ({
        name: schema.name,
        tables: schema.tables.map((table) => ({
          name: table.name,
          schema: table.schema,
          type: table.type as "table" | "view" | "materialized_view",
          rowCount: table.rowCount,
        })),
      }));
    }

    // Fallback for unsupported types - return empty
    return [];
  }

  static async listTables(
    connectionId: string,
    schema?: string,
    orgId?: string,
  ): Promise<Table[]> {
    if (!orgId) throw new Error("Organization ID is required");
    const result = await DataSourcesService.discoverSchema(orgId, connectionId);

    if (schema) {
      const foundSchema = result.schemas?.find((s) => s.name === schema);
      return foundSchema ? foundSchema.tables || [] : [];
    }

    // If no schema specified, flatten all tables? Or return empty?
    // Legacy behavior was listing tables for a schema.
    return result.schemas?.flatMap((s) => s.tables || []) || [];
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

    // Normalize MongoDB response to match expected structure
    if (result.type === "mongodb" && result.databases) {
      result.schemas = result.databases.map((db) => ({
        name: db.name,
        tables: db.collections?.map((coll: { name: string; fields?: Array<{ name: string; type: string; nullable?: boolean }> }) => ({
          name: coll.name,
          schema: db.name,
          type: "table" as const,
          columns: coll.fields?.map(
            (f) => ({
              name: f.name,
              dataType: f.type,
              nullable: f.nullable,
              isPrimaryKey: f.name === "_id", // MongoDB _id is always primary key
            }),
          ),
        })),
      }));
    }

    let targetTable: Table | undefined;

    // Handle MongoDB: table might be "database.collection" or just "collection"
    if (result.type === "mongodb") {
      if (table.includes(".")) {
        // Format: "database.collection"
        const [dbName, collName] = table.split(".");
        const foundSchema = result.schemas?.find(
          (s: Schema) => s.name === dbName,
        );
        targetTable = foundSchema?.tables?.find(
          (t: Table) => t.name === collName,
        );
      } else if (schema) {
        // Format: schema="database", table="collection"
        const foundSchema = result.schemas?.find(
          (s: Schema) => s.name === schema,
        );
        targetTable = foundSchema?.tables?.find((t: Table) => t.name === table);
      } else {
        // No schema/database specified - search all databases for the collection
        for (const s of result.schemas || []) {
          targetTable = s.tables?.find((t: Table) => t.name === table);
          if (targetTable) break;
        }
      }
    } else if (schema) {
      // For SQL databases: schema.table format
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

    // Extract columns from discovered schema
    // For PostgreSQL/MySQL: columns are in targetTable.columns (if available from Python API)
    // For MongoDB: columns are in coll.fields (already normalized above)
    const tableWithExtras = targetTable as Table & {
      columns?: Array<{
        name: string;
        type?: string;
        dataType?: string;
        nullable?: boolean;
        isPrimaryKey?: boolean;
        primaryKey?: boolean;
      }>;
      primaryKeys?: string[];
    };
    const columns = tableWithExtras.columns || [];

    // Extract primary keys if available
    const primaryKeys: string[] = [];
    if (
      tableWithExtras.primaryKeys &&
      Array.isArray(tableWithExtras.primaryKeys)
    ) {
      primaryKeys.push(...tableWithExtras.primaryKeys);
    } else if (columns) {
      // Try to find primary key columns by checking isPrimaryKey flag
      const pkColumns = columns.filter(
        (col) => col.isPrimaryKey || col.primaryKey,
      );
      primaryKeys.push(...pkColumns.map((col) => col.name));
    }

    const mappedColumns = columns.map((col) => ({
      name: col.name,
      dataType: col.type || col.dataType || "unknown",
      nullable: col.nullable !== false,
      isPrimaryKey: col.isPrimaryKey || primaryKeys.includes(col.name),
    }));

    console.log(
      `getTableSchema: Found ${mappedColumns.length} columns for ${schema || "no-schema"}.${table}`,
      {
        columns: mappedColumns.map((c) => c.name),
        primaryKeys,
      },
    );

    return {
      columns: mappedColumns,
      table: targetTable.name,
      schema: targetTable.schema || schema || "public",
      primaryKeys,
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
