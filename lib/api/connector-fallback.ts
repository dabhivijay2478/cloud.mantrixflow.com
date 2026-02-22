/**
 * Fallback connector list — used when API is unreachable.
 * Mirrors apps/new-etl/connectors/registry.py and apps/api connector-registry.fallback.ts
 */

export interface FallbackConnectorSource {
  id: string;
  type?: string;
  label: string;
  category?: string;
  cdc?: boolean;
}

export interface FallbackConnectorDestination {
  id: string;
  label: string;
}

const FALLBACK_SOURCES: FallbackConnectorSource[] = [
  { id: "source-postgres", label: "PostgreSQL", category: "Database", cdc: true },
  { id: "source-mysql", label: "MySQL", category: "Database", cdc: true },
  { id: "source-mongodb-v2", label: "MongoDB", category: "Database", cdc: false },
  { id: "source-mssql", label: "SQL Server", category: "Database", cdc: true },
  { id: "source-snowflake", label: "Snowflake", category: "Warehouse", cdc: false },
  { id: "source-bigquery", label: "BigQuery", category: "Warehouse", cdc: false },
  { id: "source-s3", label: "Amazon S3", category: "Storage", cdc: false },
  { id: "source-shopify", label: "Shopify", category: "E-Commerce", cdc: false },
  { id: "source-stripe", label: "Stripe", category: "Finance", cdc: false },
  { id: "source-hubspot", label: "HubSpot", category: "CRM", cdc: false },
  { id: "source-salesforce", label: "Salesforce", category: "CRM", cdc: false },
  { id: "source-github", label: "GitHub", category: "DevTools", cdc: false },
  { id: "source-google-sheets", label: "Google Sheets", category: "Google", cdc: false },
  { id: "source-google-analytics", label: "Google Analytics", category: "Analytics", cdc: false },
  { id: "source-facebook-marketing", label: "Facebook Marketing", category: "Marketing", cdc: false },
  { id: "source-airtable", label: "Airtable", category: "Product", cdc: false },
  { id: "source-notion", label: "Notion", category: "Product", cdc: false },
  { id: "source-slack", label: "Slack", category: "Collaboration", cdc: false },
  { id: "source-faker", label: "Faker", category: "Testing", cdc: false },
  { id: "source-file", label: "File", category: "Files", cdc: false },
];

const FALLBACK_DESTINATIONS: FallbackConnectorDestination[] = [
  { id: "postgres", label: "PostgreSQL" },
  { id: "bigquery", label: "BigQuery" },
  { id: "snowflake", label: "Snowflake" },
  { id: "duckdb", label: "DuckDB" },
  { id: "motherduck", label: "MotherDuck" },
  { id: "destination-mysql", label: "MySQL" },
  { id: "destination-mongodb", label: "MongoDB" },
  { id: "destination-s3", label: "S3" },
  { id: "destination-redshift", label: "Redshift" },
  { id: "destination-databricks", label: "Databricks" },
  { id: "destination-kafka", label: "Kafka" },
  { id: "destination-elasticsearch", label: "Elasticsearch" },
  { id: "destination-pinecone", label: "Pinecone" },
  { id: "destination-weaviate", label: "Weaviate" },
  { id: "destination-qdrant", label: "Qdrant" },
  { id: "destination-chroma", label: "Chroma" },
  { id: "destination-meilisearch", label: "Meilisearch" },
  { id: "destination-clickhouse", label: "ClickHouse" },
  { id: "destination-mssql", label: "MSSQL" },
];

export function getFallbackConnectors(): {
  sources: FallbackConnectorSource[];
  destinations: FallbackConnectorDestination[];
} {
  return {
    sources: FALLBACK_SOURCES.map((s) => ({ ...s, type: s.id })),
    destinations: FALLBACK_DESTINATIONS,
  };
}
