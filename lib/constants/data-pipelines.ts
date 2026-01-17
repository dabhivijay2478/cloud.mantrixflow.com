/**
 * Data Pipeline Constants
 * Shared constants for data pipeline configuration
 */

import type {
  PipelineDataSourceType,
  SyncFrequency,
  SyncMode,
  TransformationType,
  WriteMode,
} from "@/lib/api/types/data-pipelines";

// ============================================================================
// DATA SOURCE TYPES
// ============================================================================

export interface DataSourceTypeConfig {
  type: PipelineDataSourceType;
  name: string;
  description: string;
  icon: string;
  category: "database" | "warehouse" | "storage" | "api";
  color: string;
  configFields: DataSourceField[];
}

export interface DataSourceField {
  name: string;
  label: string;
  type: "text" | "number" | "password" | "select" | "textarea" | "boolean";
  required: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string }[];
}

export const DATA_SOURCE_TYPES: DataSourceTypeConfig[] = [
  {
    type: "postgres",
    name: "PostgreSQL",
    description: "Open-source relational database",
    icon: "postgres",
    category: "database",
    color: "blue",
    configFields: [
      {
        name: "host",
        label: "Host",
        type: "text",
        required: true,
        placeholder: "localhost",
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        required: true,
        defaultValue: 5432,
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        required: true,
        placeholder: "mydb",
      },
      {
        name: "schema",
        label: "Schema",
        type: "text",
        required: false,
        placeholder: "public",
        defaultValue: "public",
      },
    ],
  },
  {
    type: "mysql",
    name: "MySQL",
    description: "Popular open-source database",
    icon: "mysql",
    category: "database",
    color: "orange",
    configFields: [
      {
        name: "host",
        label: "Host",
        type: "text",
        required: true,
        placeholder: "localhost",
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        required: true,
        defaultValue: 3306,
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        required: true,
        placeholder: "mydb",
      },
    ],
  },
  {
    type: "mongodb",
    name: "MongoDB",
    description: "Document-oriented NoSQL database",
    icon: "mongodb",
    category: "database",
    color: "green",
    configFields: [
      {
        name: "connectionString",
        label: "Connection String",
        type: "text",
        required: false,
        placeholder: "mongodb://...",
      },
      {
        name: "host",
        label: "Host",
        type: "text",
        required: false,
        placeholder: "localhost",
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        required: false,
        defaultValue: 27017,
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        required: true,
        placeholder: "mydb",
      },
      {
        name: "collection",
        label: "Collection",
        type: "text",
        required: false,
        placeholder: "users",
      },
    ],
  },
  {
    type: "s3",
    name: "Amazon S3",
    description: "Cloud object storage",
    icon: "s3",
    category: "storage",
    color: "yellow",
    configFields: [
      {
        name: "bucket",
        label: "Bucket",
        type: "text",
        required: true,
        placeholder: "my-bucket",
      },
      {
        name: "region",
        label: "Region",
        type: "text",
        required: true,
        placeholder: "us-east-1",
      },
      {
        name: "prefix",
        label: "Path Prefix",
        type: "text",
        required: false,
        placeholder: "data/",
      },
      {
        name: "fileFormat",
        label: "File Format",
        type: "select",
        required: true,
        options: [
          { value: "csv", label: "CSV" },
          { value: "json", label: "JSON" },
          { value: "parquet", label: "Parquet" },
        ],
      },
    ],
  },
  {
    type: "api",
    name: "REST API",
    description: "External REST API endpoint",
    icon: "api",
    category: "api",
    color: "purple",
    configFields: [
      {
        name: "baseUrl",
        label: "Base URL",
        type: "text",
        required: true,
        placeholder: "https://api.example.com",
      },
      {
        name: "endpoint",
        label: "Endpoint",
        type: "text",
        required: true,
        placeholder: "/v1/data",
      },
      {
        name: "method",
        label: "HTTP Method",
        type: "select",
        required: true,
        options: [
          { value: "GET", label: "GET" },
          { value: "POST", label: "POST" },
        ],
      },
      {
        name: "rateLimit",
        label: "Rate Limit (req/sec)",
        type: "number",
        required: false,
        defaultValue: 10,
      },
    ],
  },
  {
    type: "bigquery",
    name: "BigQuery",
    description: "Google Cloud data warehouse",
    icon: "bigquery",
    category: "warehouse",
    color: "blue",
    configFields: [
      {
        name: "projectId",
        label: "Project ID",
        type: "text",
        required: true,
        placeholder: "my-project",
      },
      {
        name: "dataset",
        label: "Dataset",
        type: "text",
        required: true,
        placeholder: "my_dataset",
      },
    ],
  },
  {
    type: "snowflake",
    name: "Snowflake",
    description: "Cloud data warehouse",
    icon: "snowflake",
    category: "warehouse",
    color: "cyan",
    configFields: [
      {
        name: "account",
        label: "Account",
        type: "text",
        required: true,
        placeholder: "org-account",
      },
      {
        name: "warehouse",
        label: "Warehouse",
        type: "text",
        required: true,
        placeholder: "COMPUTE_WH",
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        required: true,
        placeholder: "MY_DB",
      },
      {
        name: "schema",
        label: "Schema",
        type: "text",
        required: false,
        placeholder: "PUBLIC",
        defaultValue: "PUBLIC",
      },
    ],
  },
];

// ============================================================================
// SYNC OPTIONS
// ============================================================================

export const SYNC_MODES: {
  value: SyncMode;
  label: string;
  description: string;
}[] = [
  {
    value: "full",
    label: "Full Sync",
    description: "Sync all data from source on each run",
  },
  {
    value: "incremental",
    label: "Incremental Sync",
    description: "Only sync new or changed records",
  },
];

export const SYNC_FREQUENCIES: {
  value: SyncFrequency;
  label: string;
  description: string;
}[] = [
  { value: "manual", label: "Manual", description: "Run manually when needed" },
  { value: "hourly", label: "Hourly", description: "Run every hour" },
  { value: "daily", label: "Daily", description: "Run once per day" },
  { value: "weekly", label: "Weekly", description: "Run once per week" },
];

export const WRITE_MODES: {
  value: WriteMode;
  label: string;
  description: string;
}[] = [
  {
    value: "append",
    label: "Append",
    description: "Add new rows without modifying existing data",
  },
  {
    value: "upsert",
    label: "Upsert",
    description: "Insert or update based on primary key",
  },
  {
    value: "replace",
    label: "Replace",
    description: "Drop and recreate table with new data",
  },
];

// ============================================================================
// TRANSFORMATION TYPES
// ============================================================================

export const TRANSFORMATION_TYPES: {
  value: TransformationType;
  label: string;
  description: string;
}[] = [
  { value: "rename", label: "Rename", description: "Rename a column" },
  { value: "cast", label: "Cast", description: "Convert data type" },
  {
    value: "concat",
    label: "Concatenate",
    description: "Combine multiple fields",
  },
  { value: "split", label: "Split", description: "Split field into parts" },
  { value: "filter", label: "Filter", description: "Filter rows by condition" },
  { value: "mask", label: "Mask", description: "Mask sensitive data" },
  {
    value: "hash",
    label: "Hash",
    description: "Hash values for anonymization",
  },
  {
    value: "custom",
    label: "Custom",
    description: "Custom transformation logic",
  },
];

// ============================================================================
// STATUS COLORS
// ============================================================================

export const PIPELINE_STATUS_COLORS = {
  active: "green",
  paused: "amber",
  error: "red",
} as const;

export const RUN_STATUS_COLORS = {
  pending: "gray",
  running: "blue",
  success: "green",
  failed: "red",
  cancelled: "amber",
} as const;

// ============================================================================
// UTILITIES
// ============================================================================

export function getDataSourceConfig(
  type: PipelineDataSourceType,
): DataSourceTypeConfig | undefined {
  return DATA_SOURCE_TYPES.find((ds) => ds.type === type);
}

export function getDataSourceIcon(type: PipelineDataSourceType): string {
  return getDataSourceConfig(type)?.icon || "database";
}

export function getDataSourceName(type: PipelineDataSourceType): string {
  return getDataSourceConfig(type)?.name || type;
}

export function getDataSourceCategory(type: PipelineDataSourceType): string {
  return getDataSourceConfig(type)?.category || "database";
}
