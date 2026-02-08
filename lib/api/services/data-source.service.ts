/**
 * Data Source API Service
 * Service layer for new data source endpoints (replaces postgres-connections)
 */

import { ApiClient, type PaginatedListResult } from "../client";
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
   * List data sources with server-side pagination
   */
  static async listDataSourcesPaginated(
    organizationId: string,
    limit: number = 20,
    offset: number = 0,
    filters?: { sourceType?: string; isActive?: boolean },
  ): Promise<PaginatedListResult<DataSource>> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    if (filters?.sourceType) params.append("sourceType", filters.sourceType);
    if (filters?.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());

    return ApiClient.getList<DataSource>(
      `${DataSourceService.BASE_PATH}/${organizationId}/data-sources?${params}`,
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
    const result = await ApiClient.post<Record<string, unknown>>(
      `${DataSourceService.BASE_PATH}/${organizationId}/data-sources`,
      {
        name: data.name,
        description: data.description,
        sourceType: data.source_type,
        metadata: data.metadata,
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
      name: (result.name as string) || data.name,
      description: (result.description as string) || data.description,
      sourceType:
        (result.sourceType as DataSource["sourceType"]) ||
        (result.source_type as DataSource["sourceType"]) ||
        data.source_type,
      isActive:
        (result.isActive as boolean) ??
        (result.is_active as boolean) ??
        true,
      metadata: (result.metadata as Record<string, unknown>) || data.metadata,
      createdBy:
        (result.createdBy as string) ||
        (result.created_by as string),
      createdAt,
      updatedAt,
      deletedAt: undefined,
    } as unknown as DataSource;
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
