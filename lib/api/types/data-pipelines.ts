/**
 * Data Pipelines API Types
 * Type definitions for data pipeline endpoints (updated for new schema)
 */

import type { DataSource } from "./data-sources";

export interface ColumnMapping {
  sourceColumn: string;
  destinationColumn: string;
  dataType: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey?: boolean;
  maxLength?: number;
}

export interface Transformation {
  sourceColumn: string;
  transformType: "rename" | "cast" | "concat" | "split" | "custom";
  transformConfig: Record<string, unknown>;
  destinationColumn: string;
}

export interface CreatePipelineDto {
  name: string;
  description?: string;
  sourceType: string;
  sourceDataSourceId?: string; // Changed from sourceConnectionId
  sourceConfig?: Record<string, unknown>;
  sourceSchema?: string;
  sourceTable?: string;
  sourceQuery?: string;
  destinationDataSourceId: string; // Changed from destinationConnectionId
  destinationSchema?: string;
  destinationTable: string;
  columnMappings?: ColumnMapping[];
  transformations?: Transformation[];
  writeMode?: "append" | "upsert" | "replace";
  upsertKey?: string[];
  syncMode?: "full" | "incremental";
  incrementalColumn?: string;
  syncFrequency?: "manual" | "15min" | "1hour" | "24hours";
  collectors?: Array<{
    id: string;
    sourceId: string;
    selectedTables: string[];
    transformers?: Array<{
      id: string;
      name: string;
      fieldMappings?: Record<string, string>;
      jsonSchema?: string;
    }>;
  }>;
  emitters?: Array<{
    id: string;
    transformId: string;
    destinationId: string;
    destinationName: string;
    destinationType: string;
    connectionConfig: Record<string, string>;
  }>;
}

export interface UpdatePipelineDto {
  name?: string;
  description?: string;
  sourceType?: string;
  sourceDataSourceId?: string; // Changed from sourceConnectionId
  destinationDataSourceId?: string; // Changed from destinationConnectionId
  destinationSchema?: string;
  destinationTable?: string;
  columnMappings?: ColumnMapping[];
  transformations?: Transformation[];
  writeMode?: "append" | "upsert" | "replace";
  upsertKey?: string[];
  syncMode?: "full" | "incremental";
  incrementalColumn?: string;
  syncFrequency?: "manual" | "15min" | "1hour" | "24hours";
  status?: "active" | "paused";
  collectors?: Array<{
    id: string;
    sourceId: string;
    selectedTables: string[];
    transformers?: Array<{
      id: string;
      name: string;
      collectorId?: string;
      emitterId?: string;
      fieldMappings?: Array<{ source: string; destination: string }>;
    }>;
  }>;
  emitters?: Array<{
    id: string;
    transformId: string;
    destinationId: string;
    destinationName: string;
    destinationType: string;
    connectionConfig?: Record<string, string>;
  }>;
}

export interface PipelineSourceSchema {
  id: string;
  organization_id: string; // Changed from org_id
  data_source_id: string; // Changed from source_connection_id
  name: string;
  source_type: string;
  source_schema?: string;
  source_table?: string;
  data_source?: DataSource; // New - includes full data source
}

export interface PipelineDestinationSchema {
  id: string;
  organization_id: string; // Changed from org_id
  data_source_id: string; // Changed from destination_connection_id
  name: string;
  destination_schema: string;
  destination_table: string;
  data_source?: DataSource; // New - includes full data source
}

export interface Pipeline {
  id: string;
  organization_id: string; // Changed from orgId
  created_by: string; // New field (replaces userId)
  name: string;
  description?: string;
  source_schema_id: string;
  destination_schema_id: string;
  source_schema?: PipelineSourceSchema;
  destination_schema?: PipelineDestinationSchema;
  transformations?: Transformation[];
  sync_mode: "full" | "incremental";
  sync_frequency: "manual" | "15min" | "1hour" | "24hours";
  status: "active" | "paused" | "error";
  last_run_at?: string;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  orgId?: string;
  userId?: string;
  sourceType?: string;
  sourceConnectionId?: string;
  destinationConnectionId?: string;
  sourceSchema?: string;
  sourceTable?: string;
  destinationSchema?: string;
  destinationTable?: string;
  columnMappings?: ColumnMapping[];
  writeMode?: "append" | "upsert" | "replace";
  upsertKey?: string[];
  incrementalColumn?: string;
  lastRunStatus?: "running" | "success" | "failed";
  migrationState?: "pending" | "running" | "listing" | "completed" | "error";
  nextRunAt?: string;
}

export interface PipelineRun {
  id: string;
  pipeline_id: string;
  organization_id: string;
  triggered_by: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  rows_processed?: number;
  rows_written?: number;
  execution_time_ms?: number;
  error?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  // Legacy fields
  pipelineId?: string;
  rowsProcessed?: number;
  rowsWritten?: number;
  executionTimeMs?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface PipelineStats {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalRowsProcessed: number;
  totalRowsWritten: number;
  averageExecutionTimeMs: number;
  lastRunAt?: string;
  lastRunStatus?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  warnings?: Array<{
    field: string;
    message: string;
  }>;
}

export interface AutoMapResponse {
  columnMappings: ColumnMapping[];
  confidence: number;
  warnings?: string[];
}

export interface DryRunResult {
  success: boolean;
  rowsToProcess?: number;
  estimatedTimeMs?: number;
  schemaValidation?: {
    valid: boolean;
    errors?: string[];
  };
  preview?: {
    columns: string[];
    rows: unknown[][];
    rowCount: number;
  };
  error?: string;
}
