export type ConnectorCategory =
  | "databases"
  | "warehouses"
  | "saas"
  | "files";

export interface Connector {
  id: string;
  displayName: string;
  category: ConnectorCategory;
  icon: string; // lucide icon name or emoji
  sourceCapable: boolean;
  destCapable: boolean;
  wave: 1 | 2 | 3;
  popular?: boolean;
}

export const CONNECTOR_CATEGORIES: Record<
  ConnectorCategory,
  { label: string; shortLabel: string }
> = {
  databases: { label: "Databases", shortLabel: "Databases" },
  warehouses: {
    label: "Warehouses & Lakes",
    shortLabel: "Warehouses & Lakes",
  },
  saas: { label: "SaaS & APIs", shortLabel: "SaaS & APIs" },
  files: { label: "Files & Storage", shortLabel: "Files & Storage" },
};

export const CONNECTORS: Connector[] = [
  // Wave 1 - Available
  {
    id: "postgres",
    displayName: "PostgreSQL",
    category: "databases",
    icon: "postgres",
    sourceCapable: true,
    destCapable: true,
    wave: 1,
    popular: true,
  },
  {
    id: "mysql",
    displayName: "MySQL",
    category: "databases",
    icon: "mysql",
    sourceCapable: true,
    destCapable: true,
    wave: 1,
    popular: true,
  },
  {
    id: "mariadb",
    displayName: "MariaDB",
    category: "databases",
    icon: "mariadb",
    sourceCapable: true,
    destCapable: true,
    wave: 1,
  },
  {
    id: "mssql",
    displayName: "SQL Server",
    category: "databases",
    icon: "mssql",
    sourceCapable: true,
    destCapable: true,
    wave: 1,
  },
  {
    id: "oracle",
    displayName: "Oracle",
    category: "databases",
    icon: "oracle",
    sourceCapable: true,
    destCapable: false,
    wave: 1,
  },
  {
    id: "sqlite",
    displayName: "SQLite",
    category: "databases",
    icon: "sqlite",
    sourceCapable: true,
    destCapable: true,
    wave: 1,
  },
  {
    id: "cockroachdb",
    displayName: "CockroachDB",
    category: "databases",
    icon: "cockroachdb",
    sourceCapable: true,
    destCapable: true,
    wave: 1,
  },
  // Wave 2 - Coming Soon
  {
    id: "bigquery",
    displayName: "BigQuery",
    category: "warehouses",
    icon: "bigquery",
    sourceCapable: true,
    destCapable: true,
    wave: 2,
    popular: true,
  },
  {
    id: "snowflake",
    displayName: "Snowflake",
    category: "warehouses",
    icon: "snowflake",
    sourceCapable: true,
    destCapable: true,
    wave: 2,
    popular: true,
  },
  {
    id: "redshift",
    displayName: "Redshift",
    category: "warehouses",
    icon: "redshift",
    sourceCapable: true,
    destCapable: true,
    wave: 2,
  },
  {
    id: "clickhouse",
    displayName: "ClickHouse",
    category: "warehouses",
    icon: "clickhouse",
    sourceCapable: true,
    destCapable: true,
    wave: 2,
  },
  {
    id: "duckdb",
    displayName: "DuckDB",
    category: "warehouses",
    icon: "duckdb",
    sourceCapable: true,
    destCapable: true,
    wave: 2,
  },
  {
    id: "synapse",
    displayName: "Azure Synapse",
    category: "warehouses",
    icon: "synapse",
    sourceCapable: true,
    destCapable: true,
    wave: 2,
  },
  {
    id: "databricks",
    displayName: "Databricks",
    category: "warehouses",
    icon: "databricks",
    sourceCapable: true,
    destCapable: true,
    wave: 2,
  },
  {
    id: "fabric",
    displayName: "Microsoft Fabric",
    category: "warehouses",
    icon: "fabric",
    sourceCapable: true,
    destCapable: true,
    wave: 2,
  },
  // Wave 3 - SaaS Coming Soon
  {
    id: "hubspot",
    displayName: "HubSpot",
    category: "saas",
    icon: "hubspot",
    sourceCapable: true,
    destCapable: false,
    wave: 3,
  },
  {
    id: "stripe",
    displayName: "Stripe",
    category: "saas",
    icon: "stripe",
    sourceCapable: true,
    destCapable: false,
    wave: 3,
  },
  {
    id: "shopify",
    displayName: "Shopify",
    category: "saas",
    icon: "shopify",
    sourceCapable: true,
    destCapable: false,
    wave: 3,
  },
  {
    id: "salesforce",
    displayName: "Salesforce",
    category: "saas",
    icon: "salesforce",
    sourceCapable: true,
    destCapable: false,
    wave: 3,
  },
  {
    id: "github",
    displayName: "GitHub",
    category: "saas",
    icon: "github",
    sourceCapable: true,
    destCapable: false,
    wave: 3,
  },
  {
    id: "notion",
    displayName: "Notion",
    category: "saas",
    icon: "notion",
    sourceCapable: true,
    destCapable: false,
    wave: 3,
  },
  {
    id: "slack",
    displayName: "Slack",
    category: "saas",
    icon: "slack",
    sourceCapable: true,
    destCapable: false,
    wave: 3,
  },
  {
    id: "jira",
    displayName: "Jira",
    category: "saas",
    icon: "jira",
    sourceCapable: true,
    destCapable: false,
    wave: 3,
  },
  {
    id: "zendesk",
    displayName: "Zendesk",
    category: "saas",
    icon: "zendesk",
    sourceCapable: true,
    destCapable: false,
    wave: 3,
  },
  {
    id: "google_analytics",
    displayName: "Google Analytics",
    category: "saas",
    icon: "google_analytics",
    sourceCapable: true,
    destCapable: false,
    wave: 3,
  },
  {
    id: "facebook_ads",
    displayName: "Facebook Ads",
    category: "saas",
    icon: "facebook_ads",
    sourceCapable: true,
    destCapable: false,
    wave: 3,
  },
  {
    id: "google_ads",
    displayName: "Google Ads",
    category: "saas",
    icon: "google_ads",
    sourceCapable: true,
    destCapable: false,
    wave: 3,
  },
];

export function getConnectorById(id: string): Connector | undefined {
  return CONNECTORS.find((c) => c.id === id);
}
