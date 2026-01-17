/**
 * Destination Schemas API Service
 * Service layer for pipeline destination schema endpoints
 * Updated to match refactored backend API paths
 */

import { ApiClient } from "../client";
import type {
  CreateDestinationSchemaDto,
  CreateTableResult,
  PipelineDestinationSchema,
  SchemaValidationResult,
  TableExistsResult,
  UpdateDestinationSchemaDto,
  ValidationResult,
} from "../types/data-pipelines";

export class DestinationSchemasService {
  private static readonly BASE_PATH = "api/organizations";

  /**
   * Create a new destination schema
   */
  static async createDestinationSchema(
    organizationId: string,
    data: CreateDestinationSchemaDto,
  ): Promise<PipelineDestinationSchema> {
    return ApiClient.post<PipelineDestinationSchema>(
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/pipeline-destination-schemas`,
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
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/pipeline-destination-schemas`,
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
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/pipeline-destination-schemas/${destinationSchemaId}`,
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
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/pipeline-destination-schemas/${destinationSchemaId}`,
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
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/pipeline-destination-schemas/${destinationSchemaId}`,
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
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/pipeline-destination-schemas/${destinationSchemaId}/validate`,
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
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/pipeline-destination-schemas/${destinationSchemaId}/validate-config`,
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
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/pipeline-destination-schemas/${destinationSchemaId}/table-exists`,
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
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/pipeline-destination-schemas/${destinationSchemaId}/create-table`,
    );
  }
}
