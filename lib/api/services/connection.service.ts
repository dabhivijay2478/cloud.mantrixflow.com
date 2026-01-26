/**
 * Connection API Service
 * Service layer for data source connection management endpoints
 */

import { ApiClient } from "../client";
import type {
  CreateConnectionDto,
  DataSourceConnection,
  TestConnectionResult,
  UpdateConnectionDto,
} from "../types/data-sources";

export class ConnectionService {
  private static readonly BASE_PATH = "api/organizations";

  /**
   * Create or update connection for a data source - calls Python API directly
   * Python handles validation and creates/updates the connection in Supabase
   */
  static async createOrUpdateConnection(
    organizationId: string,
    dataSourceId: string,
    data: CreateConnectionDto,
  ): Promise<DataSourceConnection> {
    // Call Python API directly for creation/update
    const { PythonETLService } = await import("./python-etl.service");

    console.log(
      "[ConnectionService] Creating/updating connection via Python service",
      {
        organizationId,
        dataSourceId,
        connection_type: data.connection_type,
      },
    );

    const result = await PythonETLService.createOrUpdateConnection(
      organizationId,
      dataSourceId,
      {
        connection_type: data.connection_type,
        config: data.config as Record<string, any>,
      },
    );

    // Map Python response (snake_case) to frontend format (camelCase)
    return {
      id: result.id,
      dataSourceId: result.data_source_id,
      connectionType: result.connection_type,
      config: result.config,
      status: result.status,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    } as DataSourceConnection;
  }

  /**
   * Get connection for a data source (with masked sensitive fields)
   * Calls Python API directly to fetch from Supabase
   */
  static async getConnection(
    organizationId: string,
    dataSourceId: string,
    includeSensitive: boolean = false,
  ): Promise<DataSourceConnection | null> {
    // Call Python API directly
    const { PythonETLService } = await import("./python-etl.service");
    const connection = await PythonETLService.getConnection(
      organizationId,
      dataSourceId,
      includeSensitive,
    );

    if (!connection) {
      return null;
    }

    // Map Python API response to DataSourceConnection format
    return {
      id: connection.id,
      data_source_id: connection.data_source_id,
      connection_type: connection.connection_type as any,
      config: connection.config,
      status: connection.status as any,
      last_connected_at: connection.last_connected_at,
      last_error: connection.last_error,
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
      ...(connection.config as Record<string, any>),
    });

    return {
      success: result.success,
      message: result.message,
      error: result.error,
      version: result.version,
      responseTimeMs: result.response_time_ms,
      details: result.details,
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
      connection_config: connection.config as Record<string, any>,
      source_config: {},
      table_name: options?.tableName,
      schema_name: options?.schemaName,
      query: options?.query,
    });

    // Return discovered schema
    return {
      columns: discovered.columns,
      primaryKeys: discovered.primaryKeys,
      estimatedRowCount: discovered.estimatedRowCount,
    };
  }
}
