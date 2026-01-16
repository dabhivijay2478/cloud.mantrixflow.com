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
   * Create or update connection for a data source
   */
  static async createOrUpdateConnection(
    organizationId: string,
    dataSourceId: string,
    data: CreateConnectionDto,
  ): Promise<DataSourceConnection> {
    return ApiClient.post<DataSourceConnection>(
      `${ConnectionService.BASE_PATH}/${organizationId}/data-sources/${dataSourceId}/connection`,
      data,
    );
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
   * Discover schema for a data source connection
   */
  static async discoverSchema(
    organizationId: string,
    dataSourceId: string,
  ): Promise<Record<string, unknown>> {
    return ApiClient.post<Record<string, unknown>>(
      `${ConnectionService.BASE_PATH}/${organizationId}/data-sources/${dataSourceId}/discover-schema`,
    );
  }
}
