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
    const { PythonETLService } = await import('./python-etl.service');
    
    console.log('[ConnectionService] Creating/updating connection via Python service', {
      organizationId,
      dataSourceId,
      connection_type: data.connection_type,
    });
    
    const result = await PythonETLService.createOrUpdateConnection(organizationId, dataSourceId, {
      connection_type: data.connection_type,
      config: data.config as Record<string, any>,
    });
    
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
   */
  static async getConnection(
    organizationId: string,
    dataSourceId: string,
    includeSensitive: boolean = false,
  ): Promise<DataSourceConnection | null> {
    const params = includeSensitive ? "?includeSensitive=true" : "";
    return ApiClient.get<DataSourceConnection | null>(
      `${ConnectionService.BASE_PATH}/${organizationId}/data-sources/${dataSourceId}/connection${params}`,
    );
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
   * Test connection for a data source
   */
  static async testConnection(
    organizationId: string,
    dataSourceId: string,
  ): Promise<TestConnectionResult> {
    return ApiClient.post<TestConnectionResult>(
      `${ConnectionService.BASE_PATH}/${organizationId}/data-sources/${dataSourceId}/test-connection`,
    );
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
    const connection = await ConnectionService.getConnection(organizationId, dataSourceId, true);
    
    if (!connection || !connection.config) {
      throw new Error('Connection not configured for this data source');
    }

    // Get data source to determine source type
    const { DataSourceService } = await import('./data-source.service');
    const dataSource = await DataSourceService.getDataSource(organizationId, dataSourceId);
    const sourceType = dataSource.sourceType?.toLowerCase() === 'postgres' ? 'postgresql' : 
                      (dataSource.sourceType?.toLowerCase() || 'postgresql');

    // Call Python service directly for schema discovery
    const { PythonETLService } = await import('./python-etl.service');
    
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
