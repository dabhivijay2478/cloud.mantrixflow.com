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

export const connectorsConfig = {
  sources: [
    {
      id: "source-postgres",
      label: "PostgreSQL",
      category: "Database",
      cdc: true,
      connectionSchema: postgresConnectionSchema,
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
