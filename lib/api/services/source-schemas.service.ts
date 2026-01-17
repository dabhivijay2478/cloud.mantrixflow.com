/**
 * Source Schemas API Service
 * Service layer for pipeline source schema endpoints
 * Updated to match refactored backend API paths
 */

import { ApiClient } from "../client";
import type {
  CreateSourceSchemaDto,
  DiscoverSchemaResult,
  PipelineSourceSchema,
  PreviewDataResult,
  UpdateSourceSchemaDto,
  ValidationResult,
} from "../types/data-pipelines";

export class SourceSchemasService {
  private static readonly BASE_PATH = "api/organizations";

  /**
   * Create a new source schema
   */
  static async createSourceSchema(
    organizationId: string,
    data: CreateSourceSchemaDto,
  ): Promise<PipelineSourceSchema> {
    return ApiClient.post<PipelineSourceSchema>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/pipeline-source-schemas`,
      data,
    );
  }

  /**
   * List all source schemas for organization
   */
  static async listSourceSchemas(
    organizationId: string,
  ): Promise<PipelineSourceSchema[]> {
    return ApiClient.get<PipelineSourceSchema[]>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/pipeline-source-schemas`,
    );
  }

  /**
   * Get source schema by ID
   */
  static async getSourceSchema(
    organizationId: string,
    sourceSchemaId: string,
  ): Promise<PipelineSourceSchema> {
    return ApiClient.get<PipelineSourceSchema>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/pipeline-source-schemas/${sourceSchemaId}`,
    );
  }

  /**
   * Update source schema
   */
  static async updateSourceSchema(
    organizationId: string,
    sourceSchemaId: string,
    data: UpdateSourceSchemaDto,
  ): Promise<PipelineSourceSchema> {
    return ApiClient.patch<PipelineSourceSchema>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/pipeline-source-schemas/${sourceSchemaId}`,
      data,
    );
  }

  /**
   * Delete source schema
   */
  static async deleteSourceSchema(
    organizationId: string,
    sourceSchemaId: string,
  ): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/pipeline-source-schemas/${sourceSchemaId}`,
    );
  }

  /**
   * Discover schema from source (columns, primary keys, row count)
   */
  static async discoverSourceSchema(
    organizationId: string,
    sourceSchemaId: string,
  ): Promise<DiscoverSchemaResult> {
    return ApiClient.post<DiscoverSchemaResult>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/pipeline-source-schemas/${sourceSchemaId}/discover`,
    );
  }

  /**
   * Validate source schema configuration
   */
  static async validateSourceSchema(
    organizationId: string,
    sourceSchemaId: string,
  ): Promise<ValidationResult> {
    return ApiClient.post<ValidationResult>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/pipeline-source-schemas/${sourceSchemaId}/validate`,
    );
  }

  /**
   * Preview sample data from source
   */
  static async previewSourceData(
    organizationId: string,
    sourceSchemaId: string,
    limit?: number,
  ): Promise<PreviewDataResult> {
    const params = limit ? `?limit=${limit}` : "";
    return ApiClient.get<PreviewDataResult>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/pipeline-source-schemas/${sourceSchemaId}/preview${params}`,
    );
  }
}
