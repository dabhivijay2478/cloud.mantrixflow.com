/**
 * Source Schemas API Service
 * Service layer for pipeline source schema endpoints
 *
 * Note: ETL operations (discover, preview) call Python service directly
 * CRUD operations still go through NestJS
 */

import { ApiClient, type PaginatedListResult } from "../client";
import type {
  ColumnInfo,
  CreateSourceSchemaDto,
  DiscoverSchemaResult,
  PipelineSourceSchema,
  PreviewDataResult,
  UpdateSourceSchemaDto,
  ValidationResult,
} from "../types/data-pipelines";
import { DataSourcesService } from "./data-sources.service";
import { PythonETLService } from "./python-etl.service";

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
   * List source schemas with server-side pagination
   */
  static async listSourceSchemasPaginated(
    organizationId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<PaginatedListResult<PipelineSourceSchema>> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    return ApiClient.getList<PipelineSourceSchema>(
      `${SourceSchemasService.BASE_PATH}/${organizationId}/pipeline-source-schemas?${params}`,
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
   * Calls Python service directly for ETL operations
   */
  static async discoverSourceSchema(
    organizationId: string,
    sourceSchemaId: string,
  ): Promise<DiscoverSchemaResult> {
    // Get source schema from NestJS (CRUD)
    const schema = await SourceSchemasService.getSourceSchema(
      organizationId,
      sourceSchemaId,
    );

    if (!schema.dataSourceId) {
      throw new Error("Source schema must have a data source ID");
    }

    // Get connection config from NestJS (with sensitive data)
    const connection = await DataSourcesService.getConnection(
      organizationId,
      schema.dataSourceId,
      true, // includeSensitive = true to get decrypted config
    );

    const connectionWithConfig = connection as typeof connection & {
      config?: Record<string, unknown>;
    };
    if (!connectionWithConfig || !connectionWithConfig.config) {
      throw new Error("Connection not configured for this data source");
    }

    // Normalize source type for Python service
    const sourceType =
      schema.sourceType?.toLowerCase() === "postgres"
        ? "postgresql"
        : schema.sourceType?.toLowerCase() || "postgresql";

    // Call Python service directly
    const discovered = await PythonETLService.discoverSchema(sourceType, {
      source_type: sourceType,
      connection_config: connectionWithConfig.config as Record<string, unknown>,
      source_config: (schema.sourceConfig as Record<string, unknown>) || {},
      table_name: schema.sourceTable || undefined,
      schema_name: schema.sourceSchema || undefined,
      query: schema.sourceQuery || undefined,
    });

    // Update schema in NestJS with discovered data
    // Note: discoveredColumns, primaryKeys, and estimatedRowCount are stored
    // in the schema's metadata, not as direct DTO fields
    const updated = await SourceSchemasService.updateSourceSchema(
      organizationId,
      sourceSchemaId,
      {} as UpdateSourceSchemaDto, // No updates needed, discovery is separate
    );

    return {
      schema: updated,
      discovered: {
        columns: discovered.columns,
        primaryKeys: discovered.primary_keys,
        estimatedRowCount: discovered.estimated_row_count,
      },
    };
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
   * Calls Python service directly for ETL operations
   */
  static async previewSourceData(
    organizationId: string,
    sourceSchemaId: string,
    limit: number = 10,
  ): Promise<PreviewDataResult> {
    // Get source schema from NestJS (CRUD)
    const schema = await SourceSchemasService.getSourceSchema(
      organizationId,
      sourceSchemaId,
    );

    if (!schema.dataSourceId) {
      throw new Error("Source schema must have a data source ID");
    }

    // Get connection config from NestJS (with sensitive data)
    const connection = await DataSourcesService.getConnection(
      organizationId,
      schema.dataSourceId,
      true, // includeSensitive = true to get decrypted config
    );

    const connectionWithConfig = connection as typeof connection & {
      config?: Record<string, unknown>;
    };
    if (!connectionWithConfig || !connectionWithConfig.config) {
      throw new Error("Connection not configured for this data source");
    }

    // Normalize source type for Python service
    const sourceType =
      schema.sourceType?.toLowerCase() === "postgres"
        ? "postgresql"
        : schema.sourceType?.toLowerCase() || "postgresql";

    // Call Python service directly to collect sample data
    const result = await PythonETLService.collect(sourceType, {
      source_type: sourceType,
      connection_config: connectionWithConfig.config as Record<string, unknown>,
      source_config: (schema.sourceConfig as Record<string, unknown>) || {},
      table_name: schema.sourceTable || undefined,
      schema_name: schema.sourceSchema || undefined,
      query: schema.sourceQuery || undefined,
      sync_mode: "full",
      limit: Math.min(limit, 100), // Cap at 100 rows for preview
      offset: 0,
    });

    // Get columns from discovered schema or infer from data
    const columns = (schema.discoveredColumns as ColumnInfo[]) || [];

    return {
      rows: result.rows,
      columns: columns.length > 0 ? columns : [], // Will be populated after discovery
    };
  }
}
