/**
 * Data Pipelines API Types
 * Type definitions for data pipeline endpoints (synced with backend DTOs)
 */

// ============================================================================
// ENUMS (matching backend)
// ============================================================================

export type PipelineDataSourceType =
  | "postgres"
  | "mysql"
  | "mongodb"
  | "s3"
  | "api"
  | "bigquery"
  | "snowflake";

export type SyncMode = "full" | "incremental";
export type SyncFrequency = "manual" | "hourly" | "daily" | "weekly";
export type WriteMode = "append" | "upsert" | "replace";
export type PipelineStatus = "active" | "paused" | "error";
export type RunStatus = "pending" | "running" | "success" | "failed" | "cancelled";
export type JobState = "pending" | "running" | "completed" | "failed";
export type TriggerType = "manual" | "scheduled" | "api";

export type TransformationType =
  | "rename"
  | "cast"
  | "concat"
  | "split"
  | "custom"
  | "filter"
  | "mask"
  | "hash";

// ============================================================================
// COLUMN MAPPING & TRANSFORMATION
// ============================================================================

export interface ColumnMapping {
  sourceColumn: string;
  destinationColumn: string;
  dataType: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey?: boolean;
  maxLength?: number;
}

export interface TransformConfig {
  targetType?: string;
  fields?: string[];
  separator?: string;
  index?: number;
  operator?: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "contains" | "startsWith" | "endsWith";
  value?: unknown;
  maskChar?: string;
  visibleChars?: number;
  algorithm?: "md5" | "sha256" | "sha512";
  expression?: string;
}

export interface Transformation {
  sourceColumn: string;
  transformType: TransformationType;
  transformConfig: TransformConfig;
  destinationColumn: string;
}

// ============================================================================
// PIPELINE DTOs
// ============================================================================

export interface CreatePipelineDto {
  name: string;
  description?: string;
  sourceSchemaId: string;
  destinationSchemaId: string;
  transformations?: Transformation[];
  syncMode?: SyncMode;
  incrementalColumn?: string;
  syncFrequency?: SyncFrequency;
}

export interface UpdatePipelineDto {
  name?: string;
  description?: string;
  status?: PipelineStatus;
  syncMode?: SyncMode;
  incrementalColumn?: string;
  syncFrequency?: SyncFrequency;
  transformations?: Transformation[];
}

export interface RunPipelineDto {
  triggerType?: TriggerType;
  batchSize?: number;
}

export interface DryRunPipelineDto {
  sampleSize?: number;
}

// ============================================================================
// SOURCE SCHEMA
// ============================================================================

export interface SourceConfig {
  // Database (Postgres, MySQL)
  host?: string;
  port?: number;
  database?: string;
  schema?: string;
  
  // MongoDB
  connectionString?: string;
  collection?: string;
  
  // S3
  bucket?: string;
  region?: string;
  prefix?: string;
  fileFormat?: "csv" | "json" | "parquet";
  
  // API
  baseUrl?: string;
  endpoint?: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  rateLimit?: number;
  
  // BigQuery
  projectId?: string;
  dataset?: string;
  
  // Snowflake
  account?: string;
  warehouse?: string;
  
  // Common
  queryTimeout?: number;
}

export interface PipelineSourceSchema {
  id: string;
  organizationId: string;
  dataSourceId?: string | null;
  sourceType: PipelineDataSourceType;
  sourceConfig?: SourceConfig | null;
  sourceSchema?: string | null;
  sourceTable?: string | null;
  sourceQuery?: string | null;
  name?: string | null;
  isActive: boolean;
  discoveredColumns?: ColumnInfo[] | null;
  primaryKeys?: string[] | null;
  estimatedRowCount?: number | null;
  lastDiscoveredAt?: string | null;
  validationResult?: ValidationResult | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateSourceSchemaDto {
  sourceType: PipelineDataSourceType;
  dataSourceId?: string;
  sourceConfig?: SourceConfig;
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
  sourceConfig?: SourceConfig;
  isActive?: boolean;
}

// ============================================================================
// DESTINATION SCHEMA
// ============================================================================

export interface PipelineDestinationSchema {
  id: string;
  organizationId: string;
  dataSourceId: string;
  destinationSchema: string;
  destinationTable: string;
  destinationTableExists: boolean;
  columnMappings?: ColumnMapping[] | null;
  writeMode: WriteMode;
  upsertKey?: string[] | null;
  name?: string | null;
  isActive: boolean;
  validationResult?: SchemaValidationResult | null;
  lastValidatedAt?: string | null;
  lastSyncedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateDestinationSchemaDto {
  dataSourceId: string;
  destinationSchema?: string;
  destinationTable: string;
  destinationTableExists?: boolean;
  columnMappings?: ColumnMapping[];
  writeMode?: WriteMode;
  upsertKey?: string[];
  name?: string;
}

export interface UpdateDestinationSchemaDto {
  name?: string;
  destinationSchema?: string;
  destinationTable?: string;
  columnMappings?: ColumnMapping[];
  writeMode?: WriteMode;
  upsertKey?: string[];
  isActive?: boolean;
}

// ============================================================================
// PIPELINE
// ============================================================================

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
  syncMode: SyncMode;
  incrementalColumn?: string | null;
  lastSyncValue?: string | null;
  syncFrequency: SyncFrequency;
  status: PipelineStatus;
  migrationState?: string | null;
  nextSyncAt?: string | null;
  lastRunAt?: string | null;
  lastRunStatus?: "success" | "failed" | null;
  lastError?: string | null;
  totalRowsProcessed?: number | null;
  totalRunsSuccessful?: number | null;
  totalRunsFailed?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface PipelineWithSchemas {
  pipeline: Pipeline;
  sourceSchema: PipelineSourceSchema;
  destinationSchema: PipelineDestinationSchema;
}

// ============================================================================
// PIPELINE RUN
// ============================================================================

export interface PipelineRun {
  id: string;
  pipelineId: string;
  organizationId: string;
  triggeredBy: string;
  triggerType: TriggerType;
  status: RunStatus;
  jobState: JobState;
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

// ============================================================================
// RESPONSES & RESULTS
// ============================================================================

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

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  missingColumns?: string[];
  typeMismatches?: Array<{
    column: string;
    expected: string;
    actual: string;
  }>;
}

export interface DryRunResult {
  wouldWrite: number;
  sourceRowCount?: number;
  sampleRows: unknown[];
  transformedSample?: unknown[];
  errors: string[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
  defaultValue?: string | null;
  maxLength?: number;
}

export interface DiscoveredSchema {
  columns: ColumnInfo[];
  primaryKeys: string[];
  estimatedRowCount?: number;
}

export interface DiscoverSchemaResult {
  schema: PipelineSourceSchema;
  discovered: DiscoveredSchema;
}

export interface TableExistsResult {
  exists: boolean;
}

export interface CreateTableResult {
  created: boolean;
  tableName: string;
}

export interface PreviewDataResult {
  rows: unknown[];
  columns: ColumnInfo[];
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
