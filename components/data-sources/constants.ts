// Connection schema configuration for each data source type
export const connectionSchemas: Record<
  string,
  {
    fields: Array<{
      name: string;
      label: string;
      type:
        | "text"
        | "password"
        | "number"
        | "textarea"
        | "file"
        | "select"
        | "checkbox";
      placeholder?: string;
      required?: boolean;
      description?: string;
      options?: Array<{ value: string; label: string }>;
      dependsOn?: { field: string; value: string | boolean };
    }>;
    connectionString?: boolean;
    testConnection?: boolean;
  }
> = {
  postgres: {
    fields: [
      {
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My PostgreSQL Connection",
        required: true,
        description: "A friendly name to identify this connection",
      },
      {
        name: "host",
        label: "Host",
        type: "text",
        placeholder: "localhost or db.example.com",
        required: true,
        description: "Database server hostname or IP address",
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
        placeholder: "postgres",
        required: true,
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "postgres",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
      {
        name: "ssl",
        label: "Enable SSL",
        type: "select",
        placeholder: "Select SSL mode",
        required: false,
        description:
          "Enable SSL for secure connections (recommended for cloud databases)",
        options: [
          { value: "false", label: "Disabled" },
          { value: "true", label: "Enabled" },
        ],
      },
    ],
    connectionString: false,
    testConnection: true,
  },
  mysql: {
    fields: [
      {
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My MySQL Connection",
        required: true,
        description: "A friendly name to identify this connection",
      },
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
        placeholder: "root",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
      {
        name: "ssl",
        label: "Enable SSL",
        type: "select",
        placeholder: "Select SSL mode",
        required: false,
        description:
          "Enable SSL/TLS for secure connections (recommended for cloud MySQL)",
        options: [
          { value: "false", label: "Disabled" },
          { value: "true", label: "Enabled" },
        ],
      },
    ],
    connectionString: true,
    testConnection: true,
  },
  mongodb: {
    fields: [
      {
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My MongoDB Connection",
        required: true,
        description: "A friendly name to identify this connection",
      },
      {
        name: "useConnectionString",
        label: "Connection Method",
        type: "select",
        required: true,
        description: "Connection string (Atlas) or individual host/credentials",
        options: [
          { value: "true", label: "Connection String (Atlas/SRV)" },
          { value: "false", label: "Individual (Host, Port, Username, Password)" },
        ],
      },
      {
        name: "connection_string",
        label: "Connection String",
        type: "password",
        placeholder: "mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0",
        required: true,
        description:
          "Full MongoDB connection string (Atlas SRV). Include username and password. URL-encode special chars (@ → %40, : → %3A).",
        dependsOn: { field: "useConnectionString", value: "true" },
      },
      {
        name: "databases",
        label: "Databases",
        type: "text",
        placeholder: "sample_mflix, test (comma-separated, or leave empty for admin)",
        required: false,
        description:
          "Databases to sync. Comma-separated (e.g. sample_mflix, test). Airbyte discovers collections from these. Leave empty to use admin.",
        dependsOn: { field: "useConnectionString", value: "true" },
      },
      {
        name: "host",
        label: "Host",
        type: "text",
        placeholder: "cluster0.xxxxx.mongodb.net or localhost",
        required: true,
        description: "MongoDB host (Atlas: cluster.xxxxx.mongodb.net)",
        dependsOn: { field: "useConnectionString", value: "false" },
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        placeholder: "27017",
        required: false,
        description: "Port (default 27017; Atlas SRV uses 27017)",
        dependsOn: { field: "useConnectionString", value: "false" },
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        placeholder: "admin",
        required: false,
        description: "Default database for auth",
        dependsOn: { field: "useConnectionString", value: "false" },
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "user",
        required: true,
        dependsOn: { field: "useConnectionString", value: "false" },
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: true,
        dependsOn: { field: "useConnectionString", value: "false" },
      },
      {
        name: "databases",
        label: "Databases",
        type: "text",
        placeholder: "sample_mflix, test (comma-separated)",
        required: false,
        description: "Databases to sync. Comma-separated. Leave empty for admin.",
        dependsOn: { field: "useConnectionString", value: "false" },
      },
    ],
    connectionString: true,
    testConnection: true,
  },
  mssql: {
    fields: [
      {
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My MS SQL Connection",
        required: true,
      },
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
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My BigQuery",
        required: true,
      },
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
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My Snowflake",
        required: true,
      },
      {
        name: "account",
        label: "Account identifier",
        type: "text",
        placeholder: "orgname-accountname or orgname-accountname.snowflakecomputing.com",
        required: true,
        description:
          "Full account identifier from Snowflake URL (format: org-account). Find in Account → Admin → Accounts or in your login URL.",
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
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My Redshift",
        required: true,
      },
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
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My ClickHouse",
        required: true,
      },
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
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My S3",
        required: true,
      },
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
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My S3 Datalake",
        required: true,
      },
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
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My Azure Blob",
        required: true,
      },
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
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My Databricks",
        required: true,
      },
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
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My Pinecone",
        required: true,
      },
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
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My Milvus",
        required: true,
      },
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
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My Weaviate",
        required: true,
      },
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
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My pgvector",
        required: true,
      },
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
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My Snowflake Cortex",
        required: true,
      },
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
        name: "name",
        label: "Connection Name",
        type: "text",
        placeholder: "My API",
        required: true,
      },
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
  // ETL registry connectors — generic API key schema
  shopify: {
    fields: [
      { name: "name", label: "Connection Name", type: "text", placeholder: "My Shopify", required: true },
      { name: "shop_name", label: "Shop Name", type: "text", placeholder: "myshop", required: true },
      { name: "api_key", label: "Admin API Key", type: "password", placeholder: "shpat_...", required: true },
    ],
    testConnection: true,
  },
  stripe: {
    fields: [
      { name: "name", label: "Connection Name", type: "text", placeholder: "My Stripe", required: true },
      { name: "api_key", label: "Secret Key", type: "password", placeholder: "sk_...", required: true },
    ],
    testConnection: true,
  },
  github: {
    fields: [
      { name: "name", label: "Connection Name", type: "text", placeholder: "My GitHub", required: true },
      { name: "api_key", label: "Personal Access Token", type: "password", placeholder: "ghp_...", required: true },
      {
        name: "repositories",
        label: "Repositories",
        type: "textarea",
        placeholder: "username/repo1 username/repo2",
        required: true,
        description:
          "Space or newline-separated. Format: owner/repo. For personal accounts, list each repo (e.g. username/repo1 username/repo2). owner/* only works for GitHub organizations, not personal accounts.",
      },
    ],
    testConnection: true,
  },
  "google-analytics": {
    fields: [
      { name: "name", label: "Connection Name", type: "text", placeholder: "My GA", required: true },
      { name: "credentials_json", label: "Service Account JSON", type: "textarea", placeholder: '{"type":"service_account",...}', required: true },
      { name: "property_id", label: "Property ID", type: "text", placeholder: "123456789", required: false },
    ],
    testConnection: true,
  },
  "facebook-marketing": {
    fields: [
      { name: "name", label: "Connection Name", type: "text", placeholder: "My FB Marketing", required: true },
      { name: "api_key", label: "Access Token", type: "password", placeholder: "EAA...", required: true },
      { name: "account_id", label: "Ad Account ID", type: "text", placeholder: "act_123", required: false },
    ],
    testConnection: true,
  },
  airtable: {
    fields: [
      { name: "name", label: "Connection Name", type: "text", placeholder: "My Airtable", required: true },
      { name: "api_key", label: "Personal Access Token", type: "password", placeholder: "pat...", required: true },
    ],
    testConnection: true,
  },
  notion: {
    fields: [
      { name: "name", label: "Connection Name", type: "text", placeholder: "My Notion", required: true },
      {
        name: "api_key",
        label: "Internal Integration Token",
        type: "password",
        placeholder: "ntn_... or secret_...",
        required: true,
        description:
          "From Notion: My integrations → your integration → Secrets tab. Important: Share at least one page with the integration (page ⋯ menu → Add connections → select your integration).",
      },
    ],
    testConnection: true,
  },
  hubspot: {
    fields: [
      { name: "name", label: "Connection Name", type: "text", placeholder: "My HubSpot", required: true },
      { name: "api_key", label: "Private App Access Token", type: "password", placeholder: "pat-...", required: true, description: "Create a private app in HubSpot and copy the access token" },
    ],
    testConnection: true,
  },
  salesforce: {
    fields: [
      { name: "name", label: "Connection Name", type: "text", placeholder: "My Salesforce", required: true },
      { name: "client_id", label: "Client ID", type: "text", placeholder: "Consumer key from Connected App", required: true },
      { name: "client_secret", label: "Client Secret", type: "password", placeholder: "••••••••", required: true },
      { name: "refresh_token", label: "Refresh Token", type: "password", placeholder: "••••••••", required: true, description: "Obtain via OAuth flow" },
      { name: "is_sandbox", label: "Sandbox", type: "checkbox", required: false },
    ],
    testConnection: true,
  },
  "google-sheets": {
    fields: [
      { name: "name", label: "Connection Name", type: "text", placeholder: "My Google Sheets", required: true },
      { name: "credentials_json", label: "Service Account JSON", type: "textarea", placeholder: '{"type":"service_account",...}', required: true, description: "Google Cloud service account with Sheets API access" },
      { name: "spreadsheet_id", label: "Spreadsheet ID (optional)", type: "text", placeholder: "From URL: docs.google.com/spreadsheets/d/SPREADSHEET_ID/", required: false },
    ],
    testConnection: true,
  },
  slack: {
    fields: [
      { name: "name", label: "Connection Name", type: "text", placeholder: "My Slack", required: true },
      { name: "api_key", label: "Bot Token", type: "password", placeholder: "xoxb-...", required: true },
    ],
    testConnection: true,
  },
  faker: {
    fields: [
      { name: "name", label: "Connection Name", type: "text", placeholder: "Faker Data", required: true },
      { name: "count", label: "Row Count", type: "number", placeholder: "1000", required: false },
      { name: "seed", label: "Seed (optional)", type: "number", placeholder: "0", required: false },
    ],
    testConnection: true,
  },
  file: {
    fields: [
      { name: "name", label: "Connection Name", type: "text", placeholder: "File Source", required: true },
      { name: "url", label: "File URL", type: "text", placeholder: "https://example.com/data.csv", required: true },
      { name: "format", label: "Format", type: "select", options: [
        { value: "csv", label: "CSV" },
        { value: "json", label: "JSON" },
        { value: "parquet", label: "Parquet" },
      ], required: false },
    ],
    testConnection: false,
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
  // postgres, mysql, mongodb come from ETL connectors (source-postgres, source-mysql, source-mongodb-v2)
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
  // ETL registry connectors (for data source page)
  { id: "shopify", name: "Shopify", type: "shopify" as const, iconType: "api" },
  { id: "stripe", name: "Stripe", type: "stripe" as const, iconType: "api" },
  { id: "github", name: "GitHub", type: "github" as const, iconType: "api" },
  {
    id: "google-analytics",
    name: "Google Analytics",
    type: "google-analytics" as const,
    iconType: "api",
  },
  {
    id: "facebook-marketing",
    name: "Facebook Marketing",
    type: "facebook-marketing" as const,
    iconType: "api",
  },
  { id: "airtable", name: "Airtable", type: "airtable" as const, iconType: "api" },
  { id: "notion", name: "Notion", type: "notion" as const, iconType: "api" },
  { id: "slack", name: "Slack", type: "slack" as const, iconType: "api" },
  { id: "faker", name: "Faker", type: "faker" as const, iconType: "api" },
  { id: "file", name: "File", type: "file" as const, iconType: "api" },
];

// Note: Tables are now fetched from the API using useTables hook
// This mock data has been removed in favor of real API integration
