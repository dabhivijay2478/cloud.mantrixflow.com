/**
 * Data Source API Service
 * Service layer for new data source endpoints (replaces postgres-connections)
 */

import { ApiClient } from "../client";
import type {
  CreateDataSourceDto,
  DataSource,
  SupportedDataSourceType,
  UpdateDataSourceDto,
} from "../types/data-sources";

export class DataSourceService {
  private static readonly BASE_PATH = "api/organizations";

  /**
   * List all data sources for an organization
   */
  static async listDataSources(
    organizationId: string,
    filters?: { sourceType?: string; isActive?: boolean },
  ): Promise<DataSource[]> {
    const params = new URLSearchParams();
    if (filters?.sourceType) params.append("sourceType", filters.sourceType);
    if (filters?.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());
    const queryString = params.toString() ? `?${params.toString()}` : "";

    return ApiClient.get<DataSource[]>(
      `${DataSourceService.BASE_PATH}/${organizationId}/data-sources${queryString}`,
    );
  }

  /**
   * Get a single data source by ID
   */
  static async getDataSource(
    organizationId: string,
    dataSourceId: string,
  ): Promise<DataSource> {
    return ApiClient.get<DataSource>(
      `${DataSourceService.BASE_PATH}/${organizationId}/data-sources/${dataSourceId}`,
    );
  }

  /**
   * Create a new data source
   */
  static async createDataSource(
    organizationId: string,
    data: CreateDataSourceDto,
  ): Promise<DataSource> {
    return ApiClient.post<DataSource>(
      `${DataSourceService.BASE_PATH}/${organizationId}/data-sources`,
      data,
    );
  }

  /**
   * Update a data source
   */
  static async updateDataSource(
    organizationId: string,
    dataSourceId: string,
    data: UpdateDataSourceDto,
  ): Promise<DataSource> {
    return ApiClient.put<DataSource>(
      `${DataSourceService.BASE_PATH}/${organizationId}/data-sources/${dataSourceId}`,
      data,
    );
  }

  /**
   * Delete a data source (soft delete)
   */
  static async deleteDataSource(
    organizationId: string,
    dataSourceId: string,
  ): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(
      `${DataSourceService.BASE_PATH}/${organizationId}/data-sources/${dataSourceId}`,
    );
  }

  /**
   * Get supported data source types with their schemas
   */
  static async getSupportedTypes(
    organizationId: string,
  ): Promise<{ types: SupportedDataSourceType[] }> {
    return ApiClient.get<{ types: SupportedDataSourceType[] }>(
      `${DataSourceService.BASE_PATH}/${organizationId}/data-sources/types`,
    );
  }
}
