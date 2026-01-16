/**
 * Destination Schemas API Service
 * Service layer for pipeline destination schema endpoints
 */

import { ApiClient } from "../client";
import type {
  CreateDestinationSchemaDto,
  PipelineDestinationSchema,
  SchemaValidationResult,
  UpdateDestinationSchemaDto,
} from "../types/data-pipelines";

export class DestinationSchemasService {
  private static readonly BASE_PATH = "api/organizations";

  // Destination Schema Management
  static async createDestinationSchema(
    organizationId: string,
    data: CreateDestinationSchemaDto,
  ): Promise<PipelineDestinationSchema> {
    return ApiClient.post<PipelineDestinationSchema>(
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/destination-schemas`,
      data,
    );
  }

  static async listDestinationSchemas(
    organizationId: string,
  ): Promise<PipelineDestinationSchema[]> {
    return ApiClient.get<PipelineDestinationSchema[]>(
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/destination-schemas`,
    );
  }

  static async getDestinationSchema(
    organizationId: string,
    destinationSchemaId: string,
  ): Promise<PipelineDestinationSchema> {
    return ApiClient.get<PipelineDestinationSchema>(
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/destination-schemas/${destinationSchemaId}`,
    );
  }

  static async updateDestinationSchema(
    organizationId: string,
    destinationSchemaId: string,
    data: UpdateDestinationSchemaDto,
  ): Promise<PipelineDestinationSchema> {
    return ApiClient.patch<PipelineDestinationSchema>(
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/destination-schemas/${destinationSchemaId}`,
      data,
    );
  }

  static async deleteDestinationSchema(
    organizationId: string,
    destinationSchemaId: string,
  ): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/destination-schemas/${destinationSchemaId}`,
    );
  }

  // Destination Schema Validation
  static async validateDestinationSchema(
    organizationId: string,
    destinationSchemaId: string,
  ): Promise<SchemaValidationResult> {
    return ApiClient.post<SchemaValidationResult>(
      `${DestinationSchemasService.BASE_PATH}/${organizationId}/destination-schemas/${destinationSchemaId}/validate`,
    );
  }
}
