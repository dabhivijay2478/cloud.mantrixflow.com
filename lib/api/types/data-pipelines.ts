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
  sourceSchemaId: string; // New: reference to source schema
  destinationSchemaId: string; // New: reference to destination schema
  transformations?: Transformation[];
  syncMode?: "full" | "incremental";
  incrementalColumn?: string;
  syncFrequency?: "manual" | "hourly" | "daily" | "weekly";
}

export interface UpdatePipelineDto {
  name?: string;
  description?: string;
  status?: "active" | "paused" | "error";
  syncMode?: "full" | "incremental";
  incrementalColumn?: string;
  syncFrequency?: "manual" | "hourly" | "daily" | "weekly";
  transformations?: Transformation[];
}

export interface PipelineSourceSchema {
  id: string;
  organizationId: string;
  dataSourceId?: string | null;
  sourceType: string;
  sourceConfig?: Record<string, unknown> | null;
  sourceSchema?: string | null;
  sourceTable?: string | null;
  sourceQuery?: string | null;
  name?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface PipelineDestinationSchema {
  id: string;
  organizationId: string;
  dataSourceId: string;
  destinationSchema: string;
  destinationTable: string;
  destinationTableExists: boolean;
  columnMappings?: ColumnMapping[] | null;
  writeMode: "append" | "upsert" | "replace";
  upsertKey?: string[] | null;
  name?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Pipeline {
  id: string;
  organizationId: string;
  createdBy: string;
  name: string;
  description?: string | null;
  sourceSchemaId: string;
  destinationSchemaId: string;
  sourceSchema?: PipelineSourceSchema;
  destinationSchema?: PipelineDestinationSchema;
  transformations?: Transformation[] | null;
  syncMode: "full" | "incremental";
  incrementalColumn?: string | null;
  syncFrequency: "manual" | "hourly" | "daily" | "weekly";
  status: "active" | "paused" | "error";
  lastRunAt?: string | null;
  lastRunStatus?: "success" | "failed" | null;
  totalRowsProcessed?: number | null;
  totalRunsSuccessful?: number | null;
  totalRunsFailed?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  organizationId: string;
  triggeredBy: string;
  triggerType: "manual" | "scheduled";
  status: "pending" | "running" | "success" | "failed" | "cancelled";
  jobState: "pending" | "running" | "completed" | "failed";
  rowsRead?: number | null;
  rowsWritten?: number | null;
  rowsSkipped?: number | null;
  rowsFailed?: number | null;
  durationSeconds?: number | null;
  errorMessage?: string | null;
  errorStack?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStats {
  totalRowsProcessed: number;
  totalRunsSuccessful: number;
  totalRunsFailed: number;
  lastSuccessfulRun?: string | null;
  averageDuration: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface DryRunResult {
  wouldWrite: number;
  sourceRowCount?: number;
  sampleRows: unknown[];
  errors: string[];
}

// Source Schema Types
export interface CreateSourceSchemaDto {
  sourceType: string;
  dataSourceId?: string;
  sourceConfig?: Record<string, unknown>;
  sourceSchema?: string;
  sourceTable?: string;
  sourceQuery?: string;
  name?: string;
}

export interface UpdateSourceSchemaDto {
  name?: string;
  sourceSchema?: string;
  sourceTable?: string;
  sourceQuery?: string;
  sourceConfig?: Record<string, unknown>;
}

export interface DiscoveredSchema {
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    primaryKey?: boolean;
  }>;
  primaryKeys: string[];
  estimatedRowCount?: number;
}

// Destination Schema Types
export interface CreateDestinationSchemaDto {
  dataSourceId: string;
  destinationSchema?: string;
  destinationTable: string;
  destinationTableExists?: boolean;
  columnMappings?: ColumnMapping[];
  writeMode?: "append" | "upsert" | "replace";
  upsertKey?: string[];
  name?: string;
}

export interface UpdateDestinationSchemaDto {
  name?: string;
  destinationSchema?: string;
  destinationTable?: string;
  columnMappings?: ColumnMapping[];
  writeMode?: "append" | "upsert" | "replace";
  upsertKey?: string[];
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}
