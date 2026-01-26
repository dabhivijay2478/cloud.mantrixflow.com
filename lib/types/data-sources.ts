/**
 * Data Source Types
 * Mirrors backend types for frontend usage
 */

/**
 * Supported data source types
 */
export enum DataSourceType {
  POSTGRES = "postgres",
  MYSQL = "mysql",
  MONGODB = "mongodb",
  S3 = "s3",
  API = "api",
  BIGQUERY = "bigquery",
  SNOWFLAKE = "snowflake",
  CSV = "csv",
}

/**
 * Column information from schema discovery
 */
export interface ColumnInfo {
  name: string;
  dataType: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  defaultValue?: unknown;
  maxLength?: number;
  precision?: number;
  scale?: number;
}

/**
 * Schema information returned by schema discovery
 */
export interface SchemaInfo {
  columns: ColumnInfo[];
  primaryKeys: string[];
  estimatedRowCount?: number;
  sampleDocuments?: Record<string, unknown>[];
}

/**
 * Table information for schema navigation
 */
export interface TableInfo {
  name: string;
  type: "table" | "view" | "collection";
  schema?: string;
  columns?: ColumnInfo[];
  estimatedRowCount?: number;
  documentCount?: number;
}

/**
 * Database schema with tables
 */
export interface Schema {
  name: string;
  tables: TableInfo[];
}

/**
 * Connection test result
 */
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: {
    version?: string;
    serverInfo?: Record<string, unknown>;
    latencyMs?: number;
  };
}

/**
 * Data source connection configuration (generic)
 */
export interface DataSourceConfig {
  type: DataSourceType | string;
  name: string;

  // Database connections
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;

  // MongoDB specific
  connection_string?: string;
  auth_source?: string;

  // S3 specific
  bucket?: string;
  region?: string;
  access_key_id?: string;
  secret_access_key?: string;
  path_prefix?: string;

  // API specific
  base_url?: string;
  endpoint?: string;
  auth_type?: "none" | "bearer" | "api_key" | "basic";
  auth_token?: string;
  api_key?: string;
  api_key_header?: string;
  headers?: Record<string, string>;

  // Generic
  [key: string]: unknown;
}

/**
 * Data source entity from API
 */
export interface DataSource {
  id: string;
  organizationId: string;
  name: string;
  type: DataSourceType | string;
  config?: DataSourceConfig;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Helper to get display name for data source type
 */
export function getDataSourceTypeDisplayName(
  type: DataSourceType | string,
): string {
  const displayNames: Record<string, string> = {
    [DataSourceType.POSTGRES]: "PostgreSQL",
    [DataSourceType.MYSQL]: "MySQL",
    [DataSourceType.MONGODB]: "MongoDB",
    [DataSourceType.S3]: "Amazon S3",
    [DataSourceType.API]: "REST API",
    [DataSourceType.BIGQUERY]: "BigQuery",
    [DataSourceType.SNOWFLAKE]: "Snowflake",
    [DataSourceType.CSV]: "CSV File",
  };

  return displayNames[type] || type;
}

/**
 * Check if data source type is a SQL database
 */
export function isSQLDataSource(type: DataSourceType | string): boolean {
  return [
    DataSourceType.POSTGRES,
    DataSourceType.MYSQL,
    DataSourceType.BIGQUERY,
    DataSourceType.SNOWFLAKE,
  ].includes(type as DataSourceType);
}

/**
 * Check if data source type is a NoSQL database
 */
export function isNoSQLDataSource(type: DataSourceType | string): boolean {
  return [DataSourceType.MONGODB].includes(type as DataSourceType);
}

/**
 * Check if data source type is a file-based source
 */
export function isFileDataSource(type: DataSourceType | string): boolean {
  return [DataSourceType.S3, DataSourceType.CSV].includes(
    type as DataSourceType,
  );
}
