/**
 * Data Sources API Types
 * Type definitions for data source endpoints (new dynamic schema)
 */

export type DataSourceType =
  | "postgres"
  | "mysql"
  | "mongodb"
  | "s3"
  | "api"
  | "bigquery"
  | "snowflake"
  | "redshift";

export interface DataSource {
  id: string;
  // Support both snake_case (API) and camelCase
  organization_id?: string;
  organizationId: string;
  name: string;
  description?: string;
  source_type?: DataSourceType;
  sourceType: DataSourceType;
  is_active?: boolean;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  created_by?: string;
  createdBy?: string;
  created_at?: string;
  createdAt: string;
  updated_at?: string;
  updatedAt: string;
  deleted_at?: string;
  deletedAt?: string;
  connection?: DataSourceConnection;
}

export interface DataSourceConnection {
  id: string;
  data_source_id: string;
  connection_type: DataSourceType;
  config: ConnectionConfig;
  status: "active" | "inactive" | "error" | "testing";
  last_connected_at?: string;
  last_error?: string;
  test_result?: TestConnectionResult;
  schema_cache?: Record<string, unknown>;
  schema_cached_at?: string;
}

export type ConnectionConfig =
  | PostgresConfig
  | MySQLConfig
  | MongoDBConfig
  | S3Config
  | APIConfig
  | BigQueryConfig
  | SnowflakeConfig;

export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: {
    enabled: boolean;
    ca_cert?: string;
    client_cert?: string;
    client_key?: string;
    reject_unauthorized?: boolean;
  };
  ssh_tunnel?: {
    enabled: boolean;
    host?: string;
    port?: number;
    username?: string;
    private_key?: string;
  };
  pool?: {
    size: number;
    timeout_seconds: number;
  };
}

export interface MySQLConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: {
    enabled: boolean;
    ca_cert?: string;
  };
  charset?: string;
}

export interface MongoDBConfig {
  connection_string?: string;
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  auth_source?: string;
  replica_set?: string;
  tls?: boolean;
}

export interface S3Config {
  bucket: string;
  region: string;
  access_key_id: string;
  secret_access_key: string;
  path_prefix?: string;
  use_ssl?: boolean;
}

export interface APIConfig {
  base_url: string;
  auth_type: "none" | "basic" | "bearer" | "api_key" | "oauth2";
  auth_token?: string;
  api_key?: string;
  api_key_header?: string;
  username?: string;
  password?: string;
  headers?: Record<string, string>;
  rate_limit?: {
    requests_per_second: number;
  };
}

export interface BigQueryConfig {
  project_id: string;
  dataset: string;
  credentials: {
    private_key: string;
    client_email: string;
  };
}

export interface SnowflakeConfig {
  account: string;
  username: string;
  password: string;
  warehouse: string;
  database: string;
  schema: string;
  role?: string;
}

// DTOs for API requests
export interface CreateDataSourceDto {
  name: string;
  description?: string;
  source_type: DataSourceType;
  metadata?: Record<string, unknown>;
}

export interface UpdateDataSourceDto {
  name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateConnectionDto {
  name: string;
  connection_type: DataSourceType;
  config: ConnectionConfig;
}

export interface UpdateConnectionDto {
  connection_type?: DataSourceType;
  config?: Partial<ConnectionConfig>;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  details?: {
    version?: string;
    response_time_ms?: number;
    database_name?: string;
  };
  error?: string;
}

// Legacy types (for backward compatibility with old postgres endpoints)
export interface SSLConfig {
  enabled: boolean;
  caCert?: string;
  rejectUnauthorized?: boolean;
}

export interface SSHTunnelConfig {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  privateKey: string;
}

export interface TestConnectionDto {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: SSLConfig | null;
  sshTunnel?: SSHTunnelConfig | null;
  connectionTimeout?: number;
  queryTimeout?: number;
  poolSize?: number;
  databaseType?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  error?: string;
  version?: string;
  responseTimeMs?: number;
}

export interface Connection {
  id: string;
  // Legacy fields
  orgId?: string;
  userId?: string;
  // New fields
  organizationId?: string;
  type?: string;
  name: string;
  status: "active" | "inactive" | "error" | "connected" | "disconnected";
  port?: number;
  sslEnabled?: boolean;
  sshTunnelEnabled?: boolean;
  connectionPoolSize?: number;
  queryTimeoutSeconds?: number;
  lastConnectedAt?: Date | string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// Schema Discovery Types
export interface Database {
  name: string;
  size?: string;
  owner?: string;
}

export interface Schema {
  name: string;
  owner?: string;
  tables?: Table[];
}

export interface Table {
  name: string;
  schema: string;
  type: "table" | "view" | "materialized_view";
  rowCount?: number;
  size?: string;
}

export interface Column {
  name: string;
  dataType: string;
  nullable: boolean;
  defaultValue?: string | null;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  maxLength?: number;
  numericPrecision?: number;
  numericScale?: number;
}

export interface TableSchema {
  table: string;
  schema: string;
  columns: Column[];
  primaryKeys: string[];
  indexes?: Array<{
    name: string;
    columns: string[];
    unique: boolean;
  }>;
  foreignKeys?: Array<{
    name: string;
    columns: string[];
    referencedTable: string;
    referencedColumns: string[];
  }>;
}

// Query Execution Types
export interface ExecuteQueryDto {
  query: string;
  params?: unknown[];
  timeout?: number;
  maxRows?: number;
}

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
  executionTimeMs: number;
}

export interface QueryExecutionResponse {
  success: boolean;
  result?: QueryResult;
  error?: string;
  executionTimeMs?: number;
}

export interface ExplainQueryResponse {
  plan: string;
  executionTimeMs: number;
}

// Sync Job Types
export interface CreateSyncJobDto {
  sourceTable: string;
  sourceSchema?: string;
  destinationTable: string;
  destinationSchema?: string;
  writeMode?: "append" | "upsert" | "replace";
  columnMappings?: Array<{
    source: string;
    destination: string;
  }>;
  whereClause?: string;
  limit?: number;
}

export interface SyncJob {
  id: string;
  connectionId: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  sourceTable: string;
  destinationTable: string;
  rowsProcessed?: number;
  rowsWritten?: number;
  error?: string;
  startedAt?: Date | string;
  completedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UpdateSyncJobScheduleDto {
  frequency?: "manual" | "15min" | "1hour" | "24hours";
  enabled?: boolean;
}

// Health & Monitoring Types
export interface ConnectionHealth {
  status: "healthy" | "unhealthy" | "degraded";
  responseTimeMs: number;
  lastCheckedAt: Date | string;
  version?: string;
  activeConnections?: number;
  errors?: string[];
}

export interface QueryLog {
  id: string;
  query: string;
  executionTimeMs: number;
  rowCount?: number;
  success: boolean;
  error?: string;
  executedAt: Date | string;
}

export interface ConnectionMetrics {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageExecutionTimeMs: number;
  totalRowsProcessed: number;
  activeConnections: number;
  poolSize: number;
  last24Hours?: {
    queries: number;
    averageExecutionTimeMs: number;
  };
}

// Supported types response
export interface SupportedDataSourceType {
  type: DataSourceType;
  name: string;
  description: string;
  icon?: string;
  config_schema: Record<string, unknown>;
}
