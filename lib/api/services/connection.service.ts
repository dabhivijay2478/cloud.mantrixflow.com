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
   * Test a saved connection via NestJS.
   */
  static async testConnection(
    organizationId: string,
    dataSourceId: string,
  ): Promise<TestConnectionResult> {
    const result = await ApiClient.post<{
      success: boolean;
      message?: string;
      error?: string;
      details?: {
        version?: string;
        response_time_ms?: number;
        database_name?: string;
      };
    }>(
      `${ConnectionService.BASE_PATH}/${organizationId}/data-sources/${dataSourceId}/test-connection`,
      {},
    );

    return {
      success: result.success,
      message:
        result.message ||
        (result.success
          ? "Connection successful"
          : result.error || "Connection failed"),
      error: result.error,
      details: result.details,
    };
  }

  /**
   * Discover schema for a saved connection via NestJS.
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
    const discovered = await ApiClient.post<{
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
    }>(
      `${ConnectionService.BASE_PATH}/${organizationId}/data-sources/${dataSourceId}/discover-schema`,
      {
        table_name: options?.tableName,
        schema_name: options?.schemaName,
        query: options?.query,
      },
    );

    // Return discovered schema
    return {
      columns: discovered.columns ?? [],
      primaryKeys: discovered.primary_keys ?? discovered.primaryKeys ?? [],
      estimatedRowCount:
        discovered.estimated_row_count ?? discovered.estimatedRowCount,
    };
  }
}
