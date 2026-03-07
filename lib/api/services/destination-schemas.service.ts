/**
 * Destination Schemas API Service
 * Service layer for pipeline destination schema endpoints
 * Updated to match refactored backend API paths
 */

import { ApiClient, type PaginatedListResult } from "../client";
import { orgPath } from "../constants";
import type {
  CreateDestinationSchemaDto,
  CreateTableResult,
  PipelineDestinationSchema,
  PreviewDataResult,
  SchemaValidationResult,
  TableExistsResult,
  UpdateDestinationSchemaDto,
  ValidationResult,
} from "../types/data-pipelines";

export class DestinationSchemasService {
  /**
   * Create a new destination schema
   */
  static async createDestinationSchema(
    organizationId: string,
    data: CreateDestinationSchemaDto,
  ): Promise<PipelineDestinationSchema> {
    return ApiClient.post<PipelineDestinationSchema>(
      `${orgPath(organizationId)}/pipeline-destination-schemas`,
      data,
    );
  }

  /**
   * List all destination schemas for organization
   */
  static async listDestinationSchemas(
    organizationId: string,
  ): Promise<PipelineDestinationSchema[]> {
    return ApiClient.get<PipelineDestinationSchema[]>(
      `${orgPath(organizationId)}/pipeline-destination-schemas`,
    );
  }

  /**
   * List destination schemas with server-side pagination
   */
  static async listDestinationSchemasPaginated(
    organizationId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<PaginatedListResult<PipelineDestinationSchema>> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    return ApiClient.getList<PipelineDestinationSchema>(
      `${orgPath(organizationId)}/pipeline-destination-schemas?${params}`,
    );
  }

  /**
   * Get destination schema by ID
   */
  static async getDestinationSchema(
    organizationId: string,
    destinationSchemaId: string,
  ): Promise<PipelineDestinationSchema> {
    return ApiClient.get<PipelineDestinationSchema>(
      `${orgPath(organizationId)}/pipeline-destination-schemas/${destinationSchemaId}`,
    );
  }

  /**
   * Update destination schema
   */
  static async updateDestinationSchema(
    organizationId: string,
    destinationSchemaId: string,
    data: UpdateDestinationSchemaDto,
  ): Promise<PipelineDestinationSchema> {
    return ApiClient.patch<PipelineDestinationSchema>(
      `${orgPath(organizationId)}/pipeline-destination-schemas/${destinationSchemaId}`,
      data,
    );
  }

  /**
   * Delete destination schema
   */
  static async deleteDestinationSchema(
    organizationId: string,
    destinationSchemaId: string,
  ): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(
      `${orgPath(organizationId)}/pipeline-destination-schemas/${destinationSchemaId}`,
    );
  }

  /**
   * Validate destination schema against actual database
   */
  static async validateDestinationSchema(
    organizationId: string,
    destinationSchemaId: string,
  ): Promise<SchemaValidationResult> {
    return ApiClient.post<SchemaValidationResult>(
      `${orgPath(organizationId)}/pipeline-destination-schemas/${destinationSchemaId}/validate`,
    );
  }

  /**
   * Validate configuration without querying database
   */
  static async validateConfiguration(
    organizationId: string,
    destinationSchemaId: string,
  ): Promise<ValidationResult> {
    return ApiClient.post<ValidationResult>(
      `${orgPath(organizationId)}/pipeline-destination-schemas/${destinationSchemaId}/validate-config`,
    );
  }

  /**
   * Check if destination table exists
   */
  static async checkTableExists(
    organizationId: string,
    destinationSchemaId: string,
  ): Promise<TableExistsResult> {
    return ApiClient.get<TableExistsResult>(
      `${orgPath(organizationId)}/pipeline-destination-schemas/${destinationSchemaId}/table-exists`,
    );
  }

  /**
   * Create destination table based on column mappings
   */
  static async createTable(
    organizationId: string,
    destinationSchemaId: string,
  ): Promise<CreateTableResult> {
    return ApiClient.post<CreateTableResult>(
      `${orgPath(organizationId)}/pipeline-destination-schemas/${destinationSchemaId}/create-table`,
    );
  }

  /**
   * Preview transformed output for the linked pipeline without writing data.
   */
  static async previewDestinationData(
    organizationId: string,
    destinationSchemaId: string,
    limit: number = 10,
  ): Promise<PreviewDataResult> {
    return ApiClient.post<PreviewDataResult>(
      `${orgPath(organizationId)}/pipeline-destination-schemas/${destinationSchemaId}/preview`,
      {
        limit: Math.min(limit, 100),
      },
    );
  }
}
