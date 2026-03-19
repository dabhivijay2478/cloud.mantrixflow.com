/**
 * Mock data for MANTrixFlow Pipeline Builder (Wave 1)
 * No API calls — all data is local
 */

export const MOCK_PIPELINE = {
  id: "pipeline-mock-001",
  name: "Sync Orders to Analytics",
  description: "Sync production data to analytics warehouse",
  organizationId: "org-mock-001",
  builder_view_mode: "card" as const,
  scheduleType: "minutes" as const,
  scheduleValue: "30",
  scheduleTimezone: "UTC",
  last_run_at: "2025-06-15T10:30:00Z",
  last_run_status: "success" as const,

  pipeline_graph: {
    nodes: [
      {
        id: "source-1",
        type: "source" as const,
        position: { x: 100, y: 300 },
        data: {
          connection_id: "conn-src-001",
          connector_type: "postgres",
          connection_name: "Production Postgres",
          host_summary: "prod.db.company.com:5432/mydb",
          selected_streams: ["users", "orders", "products"],
          stream_configs: {
            users: {
              replication_method: "INCREMENTAL",
              replication_key: "updated_at",
            },
            orders: {
              replication_method: "INCREMENTAL",
              replication_key: "id",
            },
            products: {
              replication_method: "FULL_TABLE",
              replication_key: null,
            },
          },
          replication_method: "INCREMENTAL",
          is_active: true,
        },
      },
      {
        id: "transform-1",
        type: "transform" as const,
        branch_id: "branch-1",
        position: { x: 450, y: 150 },
        data: {
          transform_type: "python_script",
          transform_script:
            "def transform(record):\n    record['customer_id'] = record.pop('user_id', None)\n    return record",
          on_transform_error: "fail",
        },
      },
      {
        id: "destination-1",
        type: "destination" as const,
        branch_id: "branch-1",
        position: { x: 800, y: 150 },
        data: {
          connection_id: "conn-dest-001",
          connector_type: "postgres",
          connection_name: "Analytics Postgres",
          host_summary: "analytics.db:5432/analytics",
          dest_schema: "public",
          dest_table: "orders",
          emit_method: "merge",
          is_active: true,
        },
      },
      {
        id: "transform-2",
        type: "transform" as const,
        branch_id: "branch-2",
        position: { x: 450, y: 450 },
        data: {
          transform_type: "none",
          transform_script: null,
          on_transform_error: "fail",
        },
      },
      {
        id: "destination-2",
        type: "destination" as const,
        branch_id: "branch-2",
        position: { x: 800, y: 450 },
        data: {
          connection_id: "conn-dest-002",
          connector_type: "bigquery",
          connection_name: "BigQuery Archive",
          host_summary: "myproject / analytics_bq",
          dest_schema: "analytics",
          dest_table: "orders_archive",
          emit_method: "append",
          is_active: true,
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "source-1",
        target: "transform-1",
        type: "dataEdge",
        sourceHandle: "branch-1",
      },
      {
        id: "e2",
        source: "transform-1",
        target: "destination-1",
        type: "dataEdge",
      },
      {
        id: "e3",
        source: "source-1",
        target: "transform-2",
        type: "dataEdge",
        sourceHandle: "branch-2",
      },
      {
        id: "e4",
        source: "transform-2",
        target: "destination-2",
        type: "dataEdge",
      },
    ],
    branches: [
      {
        id: "branch-1",
        label: "Analytics Postgres",
        transform_node_id: "transform-1",
        destination_node_id: "destination-1",
      },
      {
        id: "branch-2",
        label: "BigQuery Archive",
        transform_node_id: "transform-2",
        destination_node_id: "destination-2",
      },
    ],
  },
};

export const MOCK_STREAMS = [
  {
    stream_name: "users",
    schema_name: "public",
    row_count_estimate: 1_450_000,
    replication_key_candidates: ["updated_at", "created_at", "id"],
    columns: [
      {
        name: "id",
        type: "integer",
        nullable: false,
        primary_key: true,
      },
      {
        name: "email",
        type: "varchar",
        nullable: false,
        primary_key: false,
      },
      {
        name: "first_name",
        type: "varchar",
        nullable: true,
        primary_key: false,
      },
      {
        name: "updated_at",
        type: "timestamp",
        nullable: true,
        primary_key: false,
      },
    ],
  },
  {
    stream_name: "orders",
    schema_name: "public",
    row_count_estimate: 8_200_000,
    replication_key_candidates: ["id", "created_at"],
    columns: [
      {
        name: "id",
        type: "integer",
        nullable: false,
        primary_key: true,
      },
      {
        name: "user_id",
        type: "integer",
        nullable: false,
        primary_key: false,
      },
      {
        name: "status",
        type: "varchar",
        nullable: false,
        primary_key: false,
      },
      {
        name: "total",
        type: "numeric",
        nullable: true,
        primary_key: false,
      },
      {
        name: "created_at",
        type: "timestamp",
        nullable: true,
        primary_key: false,
      },
    ],
  },
  {
    stream_name: "products",
    schema_name: "public",
    row_count_estimate: 12_000,
    replication_key_candidates: ["id", "updated_at"],
    columns: [
      {
        name: "id",
        type: "integer",
        nullable: false,
        primary_key: true,
      },
      {
        name: "sku",
        type: "varchar",
        nullable: false,
        primary_key: false,
      },
      {
        name: "name",
        type: "varchar",
        nullable: false,
        primary_key: false,
      },
      {
        name: "price",
        type: "numeric",
        nullable: true,
        primary_key: false,
      },
    ],
  },
];

export const MOCK_RUNS = [
  {
    id: "run-001",
    status: "success" as const,
    triggered_by: "manual",
    created_at: "2025-06-15T10:30:00Z",
    duration_seconds: 134,
    rows_written: 45_231,
    rows_dropped: 2,
    rows_failed: 0,
    branch_results: [
      {
        branch_id: "branch-1",
        label: "Analytics Postgres",
        status: "success" as const,
        rows_written: 45_231,
        rows_dropped: 2,
        duration_seconds: 128,
      },
      {
        branch_id: "branch-2",
        label: "BigQuery Archive",
        status: "success" as const,
        rows_written: 45_231,
        rows_dropped: 0,
        duration_seconds: 134,
      },
    ],
    schema_evolutions: 1,
  },
  {
    id: "run-002",
    status: "failed" as const,
    triggered_by: "schedule",
    created_at: "2025-06-15T09:00:00Z",
    duration_seconds: 30,
    rows_written: 12_000,
    rows_dropped: 0,
    rows_failed: 0,
    branch_results: [
      {
        branch_id: "branch-1",
        label: "Analytics Postgres",
        status: "success" as const,
        rows_written: 12_000,
        rows_dropped: 0,
        duration_seconds: 28,
      },
      {
        branch_id: "branch-2",
        label: "BigQuery Archive",
        status: "failed" as const,
        rows_written: 0,
        rows_dropped: 0,
        duration_seconds: 30,
        error: "Connection timeout after 30s",
      },
    ],
    schema_evolutions: 0,
  },
  {
    id: "run-003",
    status: "success" as const,
    triggered_by: "schedule",
    created_at: "2025-06-15T08:30:00Z",
    duration_seconds: 128,
    rows_written: 44_891,
    rows_dropped: 0,
    rows_failed: 0,
    branch_results: [
      {
        branch_id: "branch-1",
        label: "Analytics Postgres",
        status: "success" as const,
        rows_written: 44_891,
        rows_dropped: 0,
        duration_seconds: 128,
      },
      {
        branch_id: "branch-2",
        label: "BigQuery Archive",
        status: "success" as const,
        rows_written: 44_891,
        rows_dropped: 0,
        duration_seconds: 124,
      },
    ],
    schema_evolutions: 0,
  },
];
