/**
 * Source Schemas API Service
 * Service layer for pipeline source schema endpoints
 *
 * Note: ETL operations (discover, preview) call Python service directly
 * CRUD operations still go through NestJS
 */

import {
  createResource,
  deleteResource,
  getResource,
  listResource,
  listResourcePaginated,
  updateResource,
} from "../base-organization-service";
import { ApiClient } from "../client";
import { orgPath } from "../constants";
import type {
  ColumnInfo,
  CreateSourceSchemaDto,
  DiscoverSchemaResult,
  PipelineSourceSchema,
  PreviewDataResult,
  UpdateSourceSchemaDto,
  ValidationResult,
} from "../types/data-pipelines";

export class SourceSchemasService {
  /**
   * Create a new source schema
   */
  static async createSourceSchema(
    organizationId: string,
    data: CreateSourceSchemaDto,
  ): Promise<PipelineSourceSchema> {
    return createResource<PipelineSourceSchema, CreateSourceSchemaDto>(
      organizationId,
      "pipeline-source-schemas",
      data,
    );
  }

  static async listSourceSchemas(
    organizationId: string,
  ): Promise<PipelineSourceSchema[]> {
    return listResource<PipelineSourceSchema>(
      organizationId,
      "pipeline-source-schemas",
    );
  }

  static async listSourceSchemasPaginated(
    organizationId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<import("../client").PaginatedListResult<PipelineSourceSchema>> {
    return listResourcePaginated<PipelineSourceSchema>(
      organizationId,
      "pipeline-source-schemas",
      limit,
      offset,
    );
  }

  static async getSourceSchema(
    organizationId: string,
    sourceSchemaId: string,
  ): Promise<PipelineSourceSchema> {
    return getResource<PipelineSourceSchema>(
      organizationId,
      "pipeline-source-schemas",
      sourceSchemaId,
    );
  }

  static async updateSourceSchema(
    organizationId: string,
    sourceSchemaId: string,
    data: UpdateSourceSchemaDto,
  ): Promise<PipelineSourceSchema> {
    return updateResource<PipelineSourceSchema, UpdateSourceSchemaDto>(
      organizationId,
      "pipeline-source-schemas",
      sourceSchemaId,
      data,
    );
  }

  static async deleteSourceSchema(
    organizationId: string,
    sourceSchemaId: string,
  ): Promise<{ deletedId: string }> {
    return deleteResource(
      organizationId,
      "pipeline-source-schemas",
      sourceSchemaId,
    );
  }

  /**
   * Discover schema from source (columns, primary keys, row count)
   * Calls NestJS API (proxies to ETL)
   */
  static async discoverSourceSchema(
    organizationId: string,
    sourceSchemaId: string,
  ): Promise<DiscoverSchemaResult> {
    const schema = await SourceSchemasService.getSourceSchema(
      organizationId,
      sourceSchemaId,
    );

    if (!schema.dataSourceId) {
      throw new Error("Source schema must have a data source ID");
    }

    const discovered = await ApiClient.post<{
      columns?: Array<{ name: string; type?: string; table?: string; nullable?: boolean }>;
      primary_keys?: string[];
      estimated_row_count?: number;
    }>(
      `${orgPath(organizationId)}/data-sources/${schema.dataSourceId}/discover-schema`,
      {
        schema_name: schema.sourceSchema ?? "public",
        table_name: schema.sourceTable,
        query: schema.sourceQuery,
      },
    );

    const columns: ColumnInfo[] = (discovered.columns ?? []).map((c) => ({
      name: c.name,
      type: c.type ?? "string",
      nullable: c.nullable ?? true,
    }));

    return {
      schema,
      discovered: {
        columns,
        primaryKeys: discovered.primary_keys ?? [],
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
      `${orgPath(organizationId)}/pipeline-source-schemas/${sourceSchemaId}/validate`,
    );
  }

  /**
   * Preview sample data from source
   * Calls NestJS API (proxies to ETL)
   */
  static async previewSourceData(
    organizationId: string,
    sourceSchemaId: string,
    limit: number = 10,
  ): Promise<PreviewDataResult> {
    const schema = await SourceSchemasService.getSourceSchema(
      organizationId,
      sourceSchemaId,
    );

    if (!schema.dataSourceId) {
      throw new Error("Source schema must have a data source ID");
    }

    // Tap-postgres uses schema-table (dash); normalize from schema.table (dot)
    const sourceStream =
      schema.sourceSchema && schema.sourceTable
        ? `${schema.sourceSchema}-${schema.sourceTable}`
        : schema.sourceTable || "";

    if (!sourceStream) {
      throw new Error("Source table/stream is required for preview");
    }

    const result = await ApiClient.post<{
      records?: unknown[];
      columns?: string[];
      total?: number;
      stream?: string;
    }>(
      `${orgPath(organizationId)}/data-sources/${schema.dataSourceId}/preview`,
      {
        source_stream: sourceStream,
        limit: Math.min(limit, 100),
      },
    );

    const discoveredColumns = (schema.discoveredColumns as ColumnInfo[]) || [];
    const columns =
      discoveredColumns.length > 0
        ? discoveredColumns
        : (result.columns || []).map((name) => ({ name, type: "string", nullable: true }));

    return {
      rows: result.records || [],
      columns,
    };
  }
}
