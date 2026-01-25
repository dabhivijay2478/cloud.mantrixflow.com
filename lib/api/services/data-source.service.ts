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
   * Create a new data source - calls Python API directly
   * Python handles validation and creates the data source in Supabase
   */
  static async createDataSource(
    organizationId: string,
    data: CreateDataSourceDto,
  ): Promise<DataSource> {
    // Call Python API directly for creation
    const { PythonETLService } = await import('./python-etl.service');
    
    const result = await PythonETLService.createDataSource(organizationId, {
      name: data.name,
      description: data.description,
      source_type: data.source_type,
      metadata: data.metadata,
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
      deletedAt: null,
    } as DataSource;
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
   * Delete a data source - calls NestJS API directly
   * NestJS handles data source deletion
   */
  static async deleteDataSource(
    organizationId: string,
    dataSourceId: string,
  ): Promise<{ deletedId: string }> {
    // Call NestJS API directly for deletion
    const response = await ApiClient.delete<{ deletedId: string }>(
      `${DataSourceService.BASE_PATH}/${organizationId}/data-sources/${dataSourceId}`,
    );
    return { deletedId: response.deletedId || dataSourceId };
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
