/**
 * Mock pipelines for the list page (table view)
 * Used when USE_MOCK_LIST is true
 */

export interface MockListBranch {
  label: string;
  destination: {
    connector_type: string;
    connection_name: string;
  };
}

export interface MockListPipeline {
  id: string;
  name: string;
  source: {
    connector_type: string;
    connection_name: string;
  };
  branches: MockListBranch[];
  status: "success" | "failed" | "running" | "idle";
  last_run_at: string | null;
  last_run_duration: number | null;
  cron_schedule: string | null;
}

export const MOCK_LIST_PIPELINES: MockListPipeline[] = [
  {
    id: "pipeline-mock-001",
    name: "Sync Orders to Analytics",
    source: { connector_type: "postgres", connection_name: "Production Postgres" },
    branches: [
      { label: "Analytics Postgres", destination: { connector_type: "postgres", connection_name: "Analytics Postgres" } },
      { label: "BigQuery Archive", destination: { connector_type: "bigquery", connection_name: "BigQuery Archive" } },
    ],
    status: "success",
    last_run_at: "2025-06-15T10:30:00Z",
    last_run_duration: 134,
    cron_schedule: "*/30 * * * *",
  },
  {
    id: "pipeline-mock-002",
    name: "User Sync",
    source: { connector_type: "mysql", connection_name: "MySQL Analytics" },
    branches: [
      { label: "Snowflake DW", destination: { connector_type: "snowflake", connection_name: "Snowflake DW" } },
    ],
    status: "failed",
    last_run_at: "2025-06-15T09:00:00Z",
    last_run_duration: 30,
    cron_schedule: null,
  },
  {
    id: "pipeline-mock-003",
    name: "Products Catalog Sync",
    source: { connector_type: "postgres", connection_name: "Staging Postgres" },
    branches: [
      { label: "Analytics Postgres", destination: { connector_type: "postgres", connection_name: "Analytics Postgres" } },
      { label: "BigQuery", destination: { connector_type: "bigquery", connection_name: "BigQuery Prod" } },
      { label: "Snowflake", destination: { connector_type: "snowflake", connection_name: "Snowflake DW" } },
    ],
    status: "idle",
    last_run_at: null,
    last_run_duration: null,
    cron_schedule: "0 * * * *",
  },
];
