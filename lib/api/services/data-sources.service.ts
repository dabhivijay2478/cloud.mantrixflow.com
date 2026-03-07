/**
 * Data Sources API Service
 * Service layer for data source endpoints (organization-scoped)
 */

import { ApiClient } from "../client";
import { orgPath } from "../constants";
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
  private static basePath(organizationId: string) {
    return `${orgPath(organizationId)}/data-sources`;
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
    const result = await ApiClient.post<Record<string, unknown>>(
      DataSourcesService.basePath(organizationId),
      {
        name: dto.name,
        description: dto.description,
        sourceType: dto.source_type,
        connectorRole: dto.connector_role,
        metadata: dto.metadata,
      },
    );

    const createdAt =
      (result.createdAt as string) ||
      (result.created_at as string) ||
      new Date().toISOString();
    const updatedAt =
      (result.updatedAt as string) ||
      (result.updated_at as string) ||
      createdAt;

    return {
      id: (result.id as string) || "",
      organizationId:
        (result.organizationId as string) ||
        (result.organization_id as string) ||
        organizationId,
      name: (result.name as string) || dto.name,
      description: (result.description as string) || dto.description,
      sourceType:
        (result.sourceType as DataSourceType) ||
        (result.source_type as DataSourceType) ||
        dto.source_type,
      isActive:
        (result.isActive as boolean) ?? (result.is_active as boolean) ?? true,
      metadata: (result.metadata as Record<string, unknown>) || dto.metadata,
      createdBy: (result.createdBy as string) || (result.created_by as string),
      createdAt,
      updatedAt,
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
    const params = includeSensitive ? "?includeSensitive=true" : "";
    const connection = await ApiClient.get<Record<string, unknown> | null>(
      `${DataSourcesService.basePath(organizationId)}/${sourceId}/connection${params}`,
    );

    if (!connection) {
      throw new Error("Connection not found for this data source");
    }

    const createdAt =
      (connection.createdAt as string) ||
      (connection.created_at as string) ||
      new Date().toISOString();
    const updatedAt =
      (connection.updatedAt as string) ||
      (connection.updated_at as string) ||
      createdAt;

    return {
      id: (connection.id as string) || sourceId,
      organizationId,
      name: (connection.name as string) || "Connection",
      type:
        (connection.connectionType as DataSourceType) ||
        (connection.connection_type as DataSourceType) ||
        (connection.type as DataSourceType) ||
        "postgres",
      status:
        (connection.status as
          | "active"
          | "inactive"
          | "error"
          | "testing"
          | "connected"
          | "disconnected") || "inactive",
      config: (connection.config as Record<string, unknown>) || {},
      created_at: createdAt,
      createdAt,
      updated_at: updatedAt,
      updatedAt,
    } as Connection & { config: Record<string, unknown> };
  }

  /**
   * Create or update connection for a data source via NestJS
   * NestJS encrypts sensitive credentials before persistence.
   */
  static async createOrUpdateConnection(
    organizationId: string,
    sourceId: string,
    dto: CreateConnectionDto,
  ): Promise<Connection> {
    const result = await ApiClient.post<Record<string, unknown>>(
      `${DataSourcesService.basePath(organizationId)}/${sourceId}/connection`,
      {
        connectionType: dto.connection_type,
        config: dto.config,
      },
    );

    const createdAt =
      (result.createdAt as string) ||
      (result.created_at as string) ||
      new Date().toISOString();
    const updatedAt =
      (result.updatedAt as string) ||
      (result.updated_at as string) ||
      createdAt;

    return {
      id: (result.id as string) || sourceId,
      organizationId,
      name: dto.name, // Name comes from DTO, not from Python response
      type:
        (result.connectionType as string) ||
        (result.connection_type as string) ||
        dto.connection_type,
      status:
        (result.status as
          | "active"
          | "inactive"
          | "error"
          | "connected"
          | "disconnected") || "inactive",
      config: (result.config as Record<string, unknown>) || dto.config,
      created_at: createdAt,
      createdAt,
      updated_at: updatedAt,
      updatedAt,
    } as Connection;
  }

  static async testConnection(
    organizationId: string,
    sourceId: string,
  ): Promise<TestConnectionResponse> {
    const result = await ApiClient.post<{
      success: boolean;
      message?: string;
      error?: string;
      details?: {
        version?: string;
        response_time_ms?: number;
      };
    }>(
      `${DataSourcesService.basePath(organizationId)}/${sourceId}/test-connection`,
      {},
    );

    return {
      success: result.success,
      error: result.error,
      version: result.details?.version,
      responseTimeMs: result.details?.response_time_ms,
    };
  }

  /**
   * Discover schema for a data source - calls NestJS API (proxies to ETL)
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
    const raw = await ApiClient.post<{
      columns?: Array<{
        name: string;
        type?: string;
        table?: string;
        nullable?: boolean;
      }>;
      primary_keys?: string[];
      primaryKeys?: string[];
      estimated_row_count?: number;
      estimatedRowCount?: number;
      streams?: Array<{ name: string }>;
      schemas?: Array<{
        name: string;
        tables: Array<{ name: string; schema: string; type?: string }>;
      }>;
      data?: {
        columns?: Array<{
          name: string;
          type?: string;
          table?: string;
          nullable?: boolean;
        }>;
        streams?: Array<{ name: string }>;
      };
    }>(
      `${DataSourcesService.basePath(organizationId)}/${sourceId}/discover-schema`,
      {
        schema_name: options?.schemaName ?? "public",
        table_name: options?.tableName,
        query: options?.query,
      },
    );

    // Normalize response: ApiClient returns data.data when wrapped, so raw may already be unwrapped.
    // Handle both { data: { columns, streams } } and direct { columns, streams } formats.
    const rawObj =
      raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const inner =
      rawObj.data !== undefined &&
      rawObj.data !== null &&
      typeof rawObj.data === "object" &&
      !Array.isArray(rawObj.data)
        ? (rawObj.data as Record<string, unknown>)
        : rawObj;

    const discovered = {
      columns: (Array.isArray(inner.columns) ? inner.columns : []) as Array<{
        name: string;
        type?: string;
        table?: string;
        nullable?: boolean;
      }>,
      streams: (Array.isArray(inner.streams) ? inner.streams : []) as Array<{
        name: string;
      }>,
      schemas: inner.schemas as
        | Array<{
            name: string;
            tables: Array<{ name: string; schema: string; type?: string }>;
          }>
        | undefined,
    };

    let sourceType = "postgres";
    try {
      const dataSource = await DataSourcesService.getDataSource(
        organizationId,
        sourceId,
      );
      sourceType = dataSource.sourceType?.toLowerCase() || "postgres";
    } catch {
      // Infer from discovered data when getDataSource fails (e.g. 404)
      if (discovered.streams?.some((s) => s.name.includes("."))) {
        sourceType = "postgres";
      }
    }

    if (discovered.schemas && discovered.schemas.length > 0) {
      return {
        schemas: discovered.schemas.map((schema) => ({
          name: schema.name,
          tables: schema.tables.map((table) => ({
            name: table.name,
            schema: table.schema || schema.name,
            type:
              (table.type as "table" | "view" | "materialized_view") ?? "table",
            rowCount: undefined,
          })),
        })),
        type: sourceType,
      };
    }

    if (sourceType === "mongodb") {
      const schemaName = options?.schemaName ?? "public";
      const tablesFromStreams =
        discovered.streams?.map((s) => {
          const parts = s.name.split(".");
          const tableName = parts[1] ?? s.name;
          const cols =
            discovered.columns?.filter(
              (c) => (c as { table?: string }).table === tableName,
            ) ??
            discovered.columns ??
            [];
          return {
            name: tableName,
            schema: parts[0] ?? schemaName,
            type: "table" as const,
            columns: cols,
          };
        }) ?? [];
      return {
        databases: [],
        tables: tablesFromStreams as Table[],
        schemas: [{ name: schemaName, tables: tablesFromStreams }],
        type: "mongodb",
      };
    }

    const schemaName = options?.schemaName ?? "public";
    let tables: Table[];

    // Streams-first: when streams exist, use them as source of truth for table names
    if (discovered.streams && discovered.streams.length > 0) {
      tables = discovered.streams.map((s) => {
        const parts = s.name.split(".");
        const tableName = parts.length > 1 ? (parts[1] ?? s.name) : s.name;
        const streamSchema =
          parts.length > 1 ? (parts[0] ?? schemaName) : schemaName;
        const cols = (discovered.columns ?? []).filter((c) => {
          const colAny = c as {
            table?: string;
            table_name?: string;
            tableName?: string;
          };
          const t = colAny.table ?? colAny.table_name ?? colAny.tableName;
          return t === tableName;
        });
        return {
          name: tableName,
          schema: streamSchema,
          type: "table" as const,
          columns: cols,
        };
      });
    } else {
      // Fallback: build from columns only when no streams
      const columnsByTable = new Map<string, typeof discovered.columns>();
      for (const col of discovered.columns ?? []) {
        const colAny = col as {
          table?: string;
          table_name?: string;
          tableName?: string;
        };
        const tableName =
          colAny.table ?? colAny.table_name ?? colAny.tableName ?? "unknown";
        if (!columnsByTable.has(tableName)) {
          columnsByTable.set(tableName, []);
        }
        columnsByTable.get(tableName)?.push(col);
      }
      tables = Array.from(columnsByTable.entries()).map(
        ([tableName, cols]) => ({
          name: tableName,
          schema: schemaName,
          type: "table" as const,
          columns: cols ?? [],
        }),
      );
    }

    // Defensive: warn in dev when we have streams/columns but tables ended up empty
    if (
      process.env.NODE_ENV === "development" &&
      tables.length === 0 &&
      ((discovered.streams?.length ?? 0) > 0 ||
        (discovered.columns?.length ?? 0) > 0)
    ) {
      console.warn(
        "[discoverSchema] Streams or columns present but tables empty:",
        {
          streams: discovered.streams?.length,
          columns: discovered.columns?.length,
        },
      );
    }

    return {
      tables,
      schemas: [{ name: schemaName, tables }],
      type: sourceType,
    };
  }

  // ==========================================================================
  // Legacy Connection Endpoints (for backward compatibility)
  // These are deprecated, use organization-scoped endpoints above
  // ==========================================================================

  private static readonly LEGACY_BASE_PATH = "api/data-sources/postgres";

  /** @deprecated Use organization-scoped endpoints */
  /**
   * Test connection config (pre-save) - calls NestJS API
   * Uses api/connectors/test-connection (no org scope, no Python ETL required)
   */
  static async testConnectionLegacy(
    _organizationId: string,
    data: TestConnectionDto,
  ): Promise<TestConnectionResponse> {
    const connectionType = (data.type || "postgres").toLowerCase();
    const effectiveType =
      connectionType === "postgresql" ? "postgres" : connectionType;

    const port =
      typeof data.port === "number"
        ? data.port
        : data.port
          ? parseInt(String(data.port), 10)
          : effectiveType === "mongodb"
            ? 27017
            : 5432;

    const config: Record<string, unknown> = {
      host: data.host,
      port,
      database: data.database,
      username: data.username,
      password: data.password,
      ssl: data.ssl,
    };

    if (effectiveType === "mongodb") {
      const connStr =
        (data as Record<string, unknown>).connection_string ??
        (data as Record<string, unknown>).connection_string_mongo;
      if (connStr) {
        config.connection_string = connStr;
      }
      const databases = (data as Record<string, unknown>).databases;
      if (databases) {
        config.databases = databases;
      }
    }

    const result = await ApiClient.post<{
      success: boolean;
      message?: string;
      details?: Record<string, unknown>;
    }>("api/connectors/test-connection", {
      connectionType: effectiveType,
      config,
    });

    return {
      success: result.success,
      error: result.success ? undefined : result.message,
      version: result.details?.version as string | undefined,
      responseTimeMs: result.details?.response_time_ms as number | undefined,
    };
  }

  /**
   * Create data source and connection atomically.
   * Uses POST /data-sources/with-connection to prevent orphaned data sources on failure.
   */
  static async createConnection(
    data: CreateConnectionDto,
    orgId?: string,
  ): Promise<Connection> {
    if (!orgId) {
      throw new Error("Organization ID is required to create a connection");
    }

    const result = await ApiClient.post<{
      id: string;
      name: string;
      connection: {
        id: string;
        status: string;
        config: Record<string, unknown>;
        connectionType?: string;
        connection_type?: string;
      };
    }>(`${DataSourcesService.basePath(orgId)}/with-connection`, {
      name: data.name,
      connection_type: data.connection_type,
      connector_role: data.connector_role,
      config: data.config,
    });

    const conn = result.connection;
    const connectionType =
      conn.connectionType || conn.connection_type || data.connection_type;
    const now = new Date().toISOString();

    return {
      id: result.id,
      organizationId: orgId,
      name: result.name,
      type: connectionType,
      status: (conn.status as Connection["status"]) || "inactive",
      config: conn.config || {},
      created_at: now,
      createdAt: now,
      updated_at: now,
      updatedAt: now,
      connection_type: connectionType,
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
              connectorRole:
                (ds.connectorRole ?? ds.connector_role) || "source",
              orgId: ds.organizationId,
              organizationId: ds.organizationId,
              status: ds.isActive ? "active" : "inactive",
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
   * Delete connection - calls NestJS API
   * NestJS handles connection deletion directly.
   */
  static async deleteConnection(
    id: string,
    orgId?: string,
  ): Promise<{ deletedId: string }> {
    if (!orgId) {
      throw new Error("Organization ID is required to delete connection");
    }

    // Delete connection via NestJS API
    await ApiClient.delete<{ deletedId: string }>(
      `${DataSourcesService.basePath(orgId)}/${id}/connection`,
    );
    return { deletedId: id };
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
          type: (coll.type || "table") as
            | "table"
            | "view"
            | "materialized_view",
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
    const result = await DataSourcesService.discoverSchema(orgId, connectionId);

    if (result.schemas && result.schemas.length > 0) {
      const schemas = result.schemas.map((schema) => ({
        name: schema.name,
        tables: (schema.tables || []).map((table) => ({
          name: table.name,
          schema: table.schema || schema.name,
          type: table.type || "table",
          rowCount: table.rowCount,
        })),
      }));
      // Fallback: when schemas have no tables but result.tables exists (e.g. MongoDB path), merge by schema
      const hasTables = schemas.some((s) => s.tables.length > 0);
      if (!hasTables && result.tables && result.tables.length > 0) {
        const bySchema = new Map<string, typeof result.tables>();
        for (const t of result.tables) {
          const schemaName = t.schema || "public";
          if (!bySchema.has(schemaName)) bySchema.set(schemaName, []);
          bySchema.get(schemaName)?.push(t);
        }
        return Array.from(bySchema.entries()).map(([name, tables]) => ({
          name,
          tables: tables.map((table) => ({
            name: table.name,
            schema: table.schema || name,
            type: table.type || "table",
            rowCount: table.rowCount,
          })),
        }));
      }
      return schemas;
    }

    if (result.databases && result.databases.length > 0) {
      return result.databases.map((db) => ({
        name: db.name,
        tables: (db.collections || []).map((coll) => ({
          name: coll.name,
          schema: db.name,
          type: (coll.type || "table") as
            | "table"
            | "view"
            | "materialized_view",
        })),
      }));
    }

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
        tables: db.collections?.map(
          (coll: {
            name: string;
            fields?: Array<{ name: string; type: string; nullable?: boolean }>;
          }) => ({
            name: coll.name,
            schema: db.name,
            type: "table" as const,
            columns: coll.fields?.map((f) => ({
              name: f.name,
              dataType: f.type,
              nullable: f.nullable,
              isPrimaryKey: f.name === "_id", // MongoDB _id is always primary key
            })),
          }),
        ),
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
