/**
 * Connection API Service
 * Service layer for data source connection management endpoints
 */

import { ApiClient } from "../client";
import type {
  ConnectionConfig,
  CreateConnectionDto,
  DataSourceConnection,
  DataSourceType,
  TestConnectionResult,
  UpdateConnectionDto,
} from "../types/data-sources";

export class ConnectionService {
  private static readonly BASE_PATH = "api/organizations";

  /**
   * Create or update connection for a data source via NestJS
   * NestJS encrypts sensitive credentials before persistence.
   */
  static async createOrUpdateConnection(
    organizationId: string,
    dataSourceId: string,
    data: CreateConnectionDto,
  ): Promise<DataSourceConnection> {
    const result = await ApiClient.post<Record<string, unknown>>(
      `${ConnectionService.BASE_PATH}/${organizationId}/data-sources/${dataSourceId}/connection`,
      {
        connectionType: data.connection_type,
        config: data.config,
      },
    );

    const normalizedDataSourceId =
      (result.dataSourceId as string) ||
      (result.data_source_id as string) ||
      dataSourceId;

    return {
      id: (result.id as string) || dataSourceId,
      data_source_id: normalizedDataSourceId,
      connection_type:
        (result.connectionType as DataSourceType) ||
        (result.connection_type as DataSourceType) ||
        data.connection_type,
      config: (result.config as ConnectionConfig) || data.config,
      status:
        (result.status as "active" | "inactive" | "error" | "testing") ||
        "inactive",
      last_connected_at:
        (result.lastConnectedAt as string) ||
        (result.last_connected_at as string) ||
        undefined,
    } as DataSourceConnection;
  }

  /**
   * Get connection for a data source (with masked sensitive fields)
   * Calls NestJS API (source of truth for encrypted connection storage)
   */
  static async getConnection(
    organizationId: string,
    dataSourceId: string,
    includeSensitive: boolean = false,
  ): Promise<DataSourceConnection | null> {
    const params = includeSensitive ? "?includeSensitive=true" : "";
    const connection = await ApiClient.get<Record<string, unknown> | null>(
      `${ConnectionService.BASE_PATH}/${organizationId}/data-sources/${dataSourceId}/connection${params}`,
    );

    if (!connection) {
      return null;
    }

    const connectionType =
      (connection.connectionType as DataSourceType) ||
      (connection.connection_type as DataSourceType) ||
      "postgres";

    const dataSourceIdValue =
      (connection.dataSourceId as string) ||
      (connection.data_source_id as string) ||
      dataSourceId;

    return {
      id: (connection.id as string) || dataSourceId,
      data_source_id: dataSourceIdValue,
      connection_type: connectionType,
      config: connection.config as unknown as ConnectionConfig,
      status: connection.status as "active" | "inactive" | "error" | "testing",
      last_connected_at:
        (connection.lastConnectedAt as string) ||
        (connection.last_connected_at as string),
      last_error:
        (connection.lastError as string) || (connection.last_error as string),
    };
  }

  /**
   * Update connection configuration
   */
  static async updateConnection(
    organizationId: string,
    dataSourceId: string,
    data: UpdateConnectionDto,
  ): Promise<DataSourceConnection> {
    return ApiClient.put<DataSourceConnection>(
      `${ConnectionService.BASE_PATH}/${organizationId}/data-sources/${dataSourceId}/connection`,
      data,
    );
  }

  /**
   * Test connection for a data source - calls Python API directly
   * NOTE: This method is deprecated. Use PythonETLService.testConnection directly instead.
   * Kept for backward compatibility.
   */
  static async testConnection(
    organizationId: string,
    dataSourceId: string,
  ): Promise<TestConnectionResult> {
    // Get connection config first
    const connection = await ConnectionService.getConnection(
      organizationId,
      dataSourceId,
      true,
    );

    if (!connection || !connection.config) {
      throw new Error("Connection not configured for this data source");
    }

    // Get data source to determine source type
    const { DataSourceService } = await import("./data-source.service");
    const dataSource = await DataSourceService.getDataSource(
      organizationId,
      dataSourceId,
    );
    const sourceType = dataSource.sourceType?.toLowerCase() || "postgresql";

    // Call Python service directly
    const { PythonETLService } = await import("./python-etl.service");

    const result = await PythonETLService.testConnection({
      type: sourceType,
      ...(connection.config as unknown as Record<string, unknown>),
    });

    return {
      success: result.success,
      message: result.message || "",
      error: result.error,
      details: {
        version: result.version,
        response_time_ms: result.response_time_ms,
        ...result.details,
      },
    };
  }

  /**
   * Discover full schema via ETL API (Python service)
   * Returns databases, schemas, tables, and columns with data types (no row data)
   * When schemaName is provided, uses Meltano filter_schemas for schema-based discovery (reduces bandwidth)
   */
  static async discoverSchemaFull(
    organizationId: string,
    dataSourceId: string,
    options?: { schemaName?: string; tableName?: string },
  ): Promise<{
    schemas?: Array<{
      name: string;
      tables?: Array<{
        name: string;
        type?: string;
        schema?: string;
        rowCount?: number;
        columns?: Array<{ name: string; type: string; nullable?: boolean }>;
      }>;
    }>;
    databases?: Array<{
      name: string;
      collections?: Array<{
        name: string;
        type?: string;
        fields?: Array<{ name: string; type: string; nullable?: boolean }>;
      }>;
    }>;
    type?: string;
  }> {
    const { DataSourcesService } = await import("./data-sources.service");
    const result = await DataSourcesService.discoverSchema(
      organizationId,
      dataSourceId,
      options,
    );
    return result as {
      schemas?: Array<{
        name: string;
        tables?: Array<{
          name: string;
          type?: string;
          schema?: string;
          rowCount?: number;
          columns?: Array<{ name: string; type: string; nullable?: boolean }>;
        }>;
      }>;
      databases?: Array<{
        name: string;
        collections?: Array<{
          name: string;
          type?: string;
          fields?: Array<{ name: string; type: string; nullable?: boolean }>;
        }>;
      }>;
      type?: string;
    };
  }

  /**
   * Discover schema for a data source connection - calls Python API directly
   * Python handles schema discovery for all data source types
   */
  static async discoverSchema(
    organizationId: string,
    dataSourceId: string,
    options?: {
      tableName?: string;
      schemaName?: string;
      query?: string;
    },
  ): Promise<Record<string, unknown>> {
    // Get connection config first
    const connection = await ConnectionService.getConnection(
      organizationId,
      dataSourceId,
      true,
    );

    if (!connection || !connection.config) {
      throw new Error("Connection not configured for this data source");
    }

    // Get data source to determine source type
    const { DataSourceService } = await import("./data-source.service");
    const dataSource = await DataSourceService.getDataSource(
      organizationId,
      dataSourceId,
    );
    const sourceType =
      dataSource.sourceType?.toLowerCase() === "postgres"
        ? "postgresql"
        : dataSource.sourceType?.toLowerCase() || "postgresql";

    // Call Python service directly for schema discovery
    const { PythonETLService } = await import("./python-etl.service");

    const discovered = await PythonETLService.discoverSchema(sourceType, {
      source_type: sourceType,
      connection_config: connection.config as unknown as Record<
        string,
        unknown
      >,
      source_config: {},
      table_name: options?.tableName,
      schema_name: options?.schemaName,
      query: options?.query,
    });

    // Return discovered schema
    return {
      columns: discovered.columns,
      primaryKeys: discovered.primary_keys,
      estimatedRowCount: discovered.estimated_row_count,
    };
  }
}
