/**
 * Source Schemas API Service
 * Service layer for pipeline source schema endpoints
 */

import { ApiClient } from "../client";
import type {
  CreateSourceSchemaDto,
  DiscoveredSchema,
  PipelineSourceSchema,
  UpdateSourceSchemaDto,
} from "../types/data-pipelines";

export class SourceSchemasService {
  private static readonly BASE_PATH = "api/organizations";

  // Source Schema Management
  static async createSourceSchema(
    organizationId: string,
    data: CreateSourceSchemaDto,
  ): Promise<PipelineSourceSchema> {
    return ApiClient.post<PipelineSourceSchema>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/source-schemas`,
      data,
    );
  }

  static async listSourceSchemas(
    organizationId: string,
  ): Promise<PipelineSourceSchema[]> {
    return ApiClient.get<PipelineSourceSchema[]>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/source-schemas`,
    );
  }

  static async getSourceSchema(
    organizationId: string,
    sourceSchemaId: string,
  ): Promise<PipelineSourceSchema> {
    return ApiClient.get<PipelineSourceSchema>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/source-schemas/${sourceSchemaId}`,
    );
  }

  static async updateSourceSchema(
    organizationId: string,
    sourceSchemaId: string,
    data: UpdateSourceSchemaDto,
  ): Promise<PipelineSourceSchema> {
    return ApiClient.patch<PipelineSourceSchema>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/source-schemas/${sourceSchemaId}`,
      data,
    );
  }

  static async deleteSourceSchema(
    organizationId: string,
    sourceSchemaId: string,
  ): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/source-schemas/${sourceSchemaId}`,
    );
  }

  // Source Schema Discovery
  static async discoverSourceSchema(
    organizationId: string,
    sourceSchemaId: string,
  ): Promise<DiscoveredSchema> {
    return ApiClient.post<DiscoveredSchema>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/source-schemas/${sourceSchemaId}/discover`,
    );
  }
}
