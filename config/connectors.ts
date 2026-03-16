/**
 * Static connector config — single source of truth.
 * No API calls. Add connector = edit this file.
 * Schema matches ETL (config/connections.py) and ConnectionSheet (constants.ts).
 */

export type ConnectionFieldType =
  | "text"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "checkbox";

export interface ConnectionField {
  name: string;
  label: string;
  type: ConnectionFieldType;
  placeholder?: string;
  required?: boolean;
  description?: string;
  default?: number;
  options?: Array<{ value: string; label: string }>;
  dependsOn?: { field: string; value: string | boolean };
}

export interface ConnectionSchema {
  fields: ConnectionField[];
  connectionString?: boolean;
  testConnection?: boolean;
}

export interface ConnectorSource {
  id: string;
  label: string;
  category: string;
  cdc: boolean;
  connectionSchema: ConnectionSchema;
}

export interface ConnectorDestination {
  id: string;
  label: string;
  connectionSchema: ConnectionSchema;
}

const postgresConnectionSchema: ConnectionSchema = {
  fields: [
    { name: "name", label: "Connection Name", type: "text", placeholder: "My PostgreSQL Connection", required: true },
    { name: "host", label: "Host", type: "text", placeholder: "localhost or db.example.com", required: true },
    { name: "port", label: "Port", type: "number", placeholder: "5432", required: true, default: 5432 },
    { name: "database", label: "Database", type: "text", placeholder: "postgres", required: true },
    { name: "username", label: "Username", type: "text", placeholder: "postgres", required: true },
    { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: true },
    {
      name: "ssl",
      label: "Enable SSL",
      type: "select",
      placeholder: "Select SSL mode",
      required: false,
      options: [
        { value: "false", label: "Disabled" },
        { value: "true", label: "Enabled" },
      ],
    },
  ],
  connectionString: false,
  testConnection: true,
};

const mysqlConnectionSchema: ConnectionSchema = {
  fields: [
    { name: "name", label: "Connection Name", type: "text", placeholder: "My MySQL Connection", required: true },
    { name: "host", label: "Host", type: "text", placeholder: "localhost or db.example.com", required: true },
    { name: "port", label: "Port", type: "number", placeholder: "3306", required: true, default: 3306 },
    { name: "database", label: "Database", type: "text", placeholder: "mydb", required: true },
    { name: "username", label: "Username", type: "text", placeholder: "user", required: true },
    { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: true },
    {
      name: "ssl",
      label: "Enable SSL",
      type: "select",
      required: false,
      options: [
        { value: "false", label: "Disabled" },
        { value: "true", label: "Enabled" },
      ],
    },
  ],
  connectionString: false,
  testConnection: true,
};

const mssqlConnectionSchema: ConnectionSchema = {
  fields: [
    { name: "name", label: "Connection Name", type: "text", placeholder: "My SQL Server Connection", required: true },
    {
      name: "host",
      label: "Server",
      type: "text",
      placeholder: "localhost or server.database.windows.net",
      required: true,
      description: "SQL Server connection requires ODBC Driver 17 or 18 installed on the ETL server.",
    },
    { name: "port", label: "Port", type: "number", placeholder: "1433", required: true, default: 1433 },
    { name: "database", label: "Database", type: "text", placeholder: "mydb", required: true },
    { name: "username", label: "Username", type: "text", placeholder: "user", required: true },
    { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: true },
    {
      name: "ssl",
      label: "Enable SSL",
      type: "select",
      required: false,
      options: [
        { value: "false", label: "Disabled" },
        { value: "true", label: "Enabled" },
      ],
    },
  ],
  connectionString: false,
  testConnection: true,
};

const oracleConnectionSchema: ConnectionSchema = {
  fields: [
    { name: "name", label: "Connection Name", type: "text", placeholder: "My Oracle Connection", required: true },
    { name: "host", label: "Host", type: "text", placeholder: "localhost", required: true },
    { name: "port", label: "Port", type: "number", placeholder: "1521", required: true, default: 1521 },
    { name: "database", label: "Service Name / SID", type: "text", placeholder: "ORCL", required: true },
    { name: "username", label: "Username", type: "text", placeholder: "user", required: true },
    { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: true },
  ],
  connectionString: false,
  testConnection: true,
};

export const connectorsConfig = {
  sources: [
    {
      id: "source-postgres",
      label: "PostgreSQL",
      category: "Database",
      cdc: true,
      connectionSchema: postgresConnectionSchema,
    },
    {
      id: "source-mysql",
      label: "MySQL",
      category: "Database",
      cdc: false,
      connectionSchema: mysqlConnectionSchema,
    },
    {
      id: "source-mariadb",
      label: "MariaDB",
      category: "Database",
      cdc: false,
      connectionSchema: mysqlConnectionSchema,
    },
    {
      id: "source-mssql",
      label: "SQL Server",
      category: "Database",
      cdc: false,
      connectionSchema: mssqlConnectionSchema,
    },
    {
      id: "source-oracle",
      label: "Oracle",
      category: "Database",
      cdc: false,
      connectionSchema: oracleConnectionSchema,
    },
  ] as ConnectorSource[],
  destinations: [
    {
      id: "postgres",
      label: "PostgreSQL",
      connectionSchema: postgresConnectionSchema,
    },
  ] as ConnectorDestination[],
} as const;
