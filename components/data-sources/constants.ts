// Connection schema configuration for each data source type
export const connectionSchemas: Record<
  string,
  {
    fields: Array<{
      name: string;
      label: string;
      type: "text" | "password" | "number" | "textarea" | "file";
      placeholder?: string;
      required?: boolean;
      description?: string;
    }>;
    connectionString?: boolean;
    testConnection?: boolean;
  }
> = {
  postgres: {
    fields: [
      {
        name: "host",
        label: "Host",
        type: "text",
        placeholder: "localhost",
        required: true,
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        placeholder: "5432",
        required: true,
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        placeholder: "mydb",
        required: true,
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "user",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
    ],
    connectionString: true,
    testConnection: true,
  },
  mysql: {
    fields: [
      {
        name: "host",
        label: "Host",
        type: "text",
        placeholder: "localhost",
        required: true,
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        placeholder: "3306",
        required: true,
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        placeholder: "mydb",
        required: true,
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "user",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
    ],
    connectionString: true,
    testConnection: true,
  },
  mongodb: {
    fields: [
      {
        name: "host",
        label: "Host",
        type: "text",
        placeholder: "localhost",
        required: true,
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        placeholder: "27017",
        required: true,
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        placeholder: "mydb",
        required: true,
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "user",
        required: false,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: false,
      },
    ],
    connectionString: true,
    testConnection: true,
  },
  mssql: {
    fields: [
      {
        name: "host",
        label: "Server",
        type: "text",
        placeholder: "localhost",
        required: true,
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        placeholder: "1433",
        required: true,
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        placeholder: "mydb",
        required: true,
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "user",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
    ],
    connectionString: true,
    testConnection: true,
  },
  bigquery: {
    fields: [
      {
        name: "projectId",
        label: "Project ID",
        type: "text",
        placeholder: "my-project",
        required: true,
      },
      {
        name: "datasetId",
        label: "Dataset ID",
        type: "text",
        placeholder: "my_dataset",
        required: true,
      },
      {
        name: "credentials",
        label: "Service Account JSON",
        type: "textarea",
        placeholder: "Paste your service account JSON",
        required: true,
        description: "Paste your Google Cloud service account JSON credentials",
      },
    ],
    testConnection: true,
  },
  snowflake: {
    fields: [
      {
        name: "account",
        label: "Account",
        type: "text",
        placeholder: "myaccount",
        required: true,
      },
      {
        name: "warehouse",
        label: "Warehouse",
        type: "text",
        placeholder: "COMPUTE_WH",
        required: true,
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        placeholder: "mydb",
        required: true,
      },
      {
        name: "schema",
        label: "Schema",
        type: "text",
        placeholder: "PUBLIC",
        required: true,
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "user",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
    ],
    testConnection: true,
  },
  redshift: {
    fields: [
      {
        name: "host",
        label: "Host",
        type: "text",
        placeholder: "cluster.region.redshift.amazonaws.com",
        required: true,
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        placeholder: "5439",
        required: true,
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        placeholder: "dev",
        required: true,
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "awsuser",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
    ],
    connectionString: true,
    testConnection: true,
  },
  clickhouse: {
    fields: [
      {
        name: "host",
        label: "Host",
        type: "text",
        placeholder: "localhost",
        required: true,
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        placeholder: "9000",
        required: true,
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        placeholder: "default",
        required: true,
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "default",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: false,
      },
    ],
    connectionString: true,
    testConnection: true,
  },
  s3: {
    fields: [
      {
        name: "bucket",
        label: "Bucket Name",
        type: "text",
        placeholder: "my-bucket",
        required: true,
      },
      {
        name: "region",
        label: "Region",
        type: "text",
        placeholder: "us-east-1",
        required: true,
      },
      {
        name: "accessKeyId",
        label: "Access Key ID",
        type: "text",
        placeholder: "AKIAIOSFODNN7EXAMPLE",
        required: true,
      },
      {
        name: "secretAccessKey",
        label: "Secret Access Key",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
    ],
    testConnection: true,
  },
  "s3-datalake": {
    fields: [
      {
        name: "bucket",
        label: "Bucket Name",
        type: "text",
        placeholder: "my-datalake",
        required: true,
      },
      {
        name: "region",
        label: "Region",
        type: "text",
        placeholder: "us-east-1",
        required: true,
      },
      {
        name: "accessKeyId",
        label: "Access Key ID",
        type: "text",
        placeholder: "AKIAIOSFODNN7EXAMPLE",
        required: true,
      },
      {
        name: "secretAccessKey",
        label: "Secret Access Key",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
      {
        name: "prefix",
        label: "Prefix (Optional)",
        type: "text",
        placeholder: "raw/",
        required: false,
      },
    ],
    testConnection: true,
  },
  "azure-blob-storage": {
    fields: [
      {
        name: "accountName",
        label: "Account Name",
        type: "text",
        placeholder: "mystorageaccount",
        required: true,
      },
      {
        name: "containerName",
        label: "Container Name",
        type: "text",
        placeholder: "mycontainer",
        required: true,
      },
      {
        name: "accountKey",
        label: "Account Key",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
    ],
    testConnection: true,
  },
  databricks: {
    fields: [
      {
        name: "serverHostname",
        label: "Server Hostname",
        type: "text",
        placeholder: "adb-1234567890.1.azuredatabricks.net",
        required: true,
      },
      {
        name: "httpPath",
        label: "HTTP Path",
        type: "text",
        placeholder: "/sql/1.0/warehouses/abc123",
        required: true,
      },
      {
        name: "personalAccessToken",
        label: "Personal Access Token",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
    ],
    testConnection: true,
  },
  pinecone: {
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "Enter your Pinecone API key",
        required: true,
      },
      {
        name: "environment",
        label: "Environment",
        type: "text",
        placeholder: "us-east1-gcp",
        required: true,
      },
      {
        name: "indexName",
        label: "Index Name",
        type: "text",
        placeholder: "my-index",
        required: true,
      },
    ],
    testConnection: true,
  },
  milvus: {
    fields: [
      {
        name: "host",
        label: "Host",
        type: "text",
        placeholder: "localhost",
        required: true,
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        placeholder: "19530",
        required: true,
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "root",
        required: false,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: false,
      },
    ],
    testConnection: true,
  },
  weaviate: {
    fields: [
      {
        name: "url",
        label: "Weaviate URL",
        type: "text",
        placeholder: "https://your-cluster.weaviate.network",
        required: true,
      },
      {
        name: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "Enter your API key",
        required: false,
      },
    ],
    testConnection: true,
  },
  pgvector: {
    fields: [
      {
        name: "host",
        label: "Host",
        type: "text",
        placeholder: "localhost",
        required: true,
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        placeholder: "5432",
        required: true,
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        placeholder: "mydb",
        required: true,
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "user",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
    ],
    connectionString: true,
    testConnection: true,
  },
  "snowflake-cortex": {
    fields: [
      {
        name: "account",
        label: "Account",
        type: "text",
        placeholder: "myaccount",
        required: true,
      },
      {
        name: "warehouse",
        label: "Warehouse",
        type: "text",
        placeholder: "COMPUTE_WH",
        required: true,
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        placeholder: "mydb",
        required: true,
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "user",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
    ],
    testConnection: true,
  },
  api: {
    fields: [
      {
        name: "endpoint",
        label: "API Endpoint",
        type: "text",
        placeholder: "https://api.example.com",
        required: true,
      },
      {
        name: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "Enter your API key",
        required: true,
      },
      {
        name: "headers",
        label: "Custom Headers (JSON)",
        type: "textarea",
        placeholder: '{"X-Custom-Header": "value"}',
        required: false,
        description: "Optional custom headers in JSON format",
      },
    ],
    testConnection: true,
  },
  "customer-io": {
    fields: [
      {
        name: "appApiKey",
        label: "App API Key",
        type: "password",
        placeholder: "Enter your App API key",
        required: true,
      },
      {
        name: "siteId",
        label: "Site ID",
        type: "text",
        placeholder: "your-site-id",
        required: true,
      },
    ],
    testConnection: true,
  },
};

// All available data sources
export const allDataSources = [
  {
    id: "azure-blob-storage",
    name: "Azure Blob Storage",
    type: "azure-blob-storage" as const,
    iconType: "azure-blob-storage",
  },
  {
    id: "customer-io",
    name: "Customer IO",
    type: "customer-io" as const,
    iconType: "customer-io",
  },
  { id: "milvus", name: "Milvus", type: "milvus" as const, iconType: "milvus" },
  {
    id: "pinecone",
    name: "Pinecone",
    type: "pinecone" as const,
    iconType: "pinecone",
  },
  { id: "s3", name: "S3", type: "s3" as const, iconType: "s3" },
  {
    id: "snowflake",
    name: "Snowflake",
    type: "snowflake" as const,
    iconType: "snowflake",
  },
  {
    id: "bigquery",
    name: "BigQuery",
    type: "bigquery" as const,
    iconType: "bigquery",
  },
  {
    id: "databricks-lakehouse",
    name: "Databricks Lakehouse",
    type: "databricks" as const,
    iconType: "databricks",
  },
  {
    id: "ms-sql-server",
    name: "MS SQL Server",
    type: "mssql" as const,
    iconType: "mssql",
  },
  {
    id: "postgres",
    name: "Postgres",
    type: "postgres" as const,
    iconType: "postgres",
  },
  {
    id: "s3-data-lake",
    name: "S3 Data Lake",
    type: "s3-datalake" as const,
    iconType: "s3-datalake",
  },
  {
    id: "snowflake-cortex",
    name: "Snowflake Cortex",
    type: "snowflake-cortex" as const,
    iconType: "snowflake-cortex",
  },
  {
    id: "clickhouse",
    name: "Clickhouse",
    type: "clickhouse" as const,
    iconType: "clickhouse",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    type: "hubspot" as const,
    iconType: "hubspot",
  },
  {
    id: "pgvector",
    name: "PGVector",
    type: "pgvector" as const,
    iconType: "pgvector",
  },
  {
    id: "redshift",
    name: "Redshift",
    type: "redshift" as const,
    iconType: "redshift",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    type: "salesforce" as const,
    iconType: "salesforce",
    enterprise: true,
  },
  {
    id: "weaviate",
    name: "Weaviate",
    type: "weaviate" as const,
    iconType: "weaviate",
  },
  { id: "mysql", name: "MySQL", type: "mysql" as const, iconType: "mysql" },
  {
    id: "mongodb",
    name: "MongoDB",
    type: "mongodb" as const,
    iconType: "mongodb",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    type: "google-sheets" as const,
    iconType: "google-sheets",
  },
  {
    id: "excel",
    name: "Excel / CSV",
    type: "excel" as const,
    iconType: "excel",
  },
  { id: "api", name: "REST API", type: "api" as const, iconType: "api" },
];

// Note: Tables are now fetched from the API using useTables hook
// This mock data has been removed in favor of real API integration
