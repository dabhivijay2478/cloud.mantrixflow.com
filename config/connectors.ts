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

const mongodbSourceConnectionSchema: ConnectionSchema = {
  fields: [
    { name: "name", label: "Connection Name", type: "text", placeholder: "My MongoDB Connection", required: true },
    {
      name: "connectionType",
      label: "Connection Type",
      type: "select",
      placeholder: "Select connection type",
      required: true,
      options: [
        { value: "direct", label: "Direct" },
        { value: "atlas_srv", label: "Atlas SRV" },
        { value: "replica_set", label: "Replica Set" },
      ],
    },
    { name: "host", label: "Host", type: "text", placeholder: "localhost or cluster.mongodb.net", required: true },
    { name: "port", label: "Port", type: "number", placeholder: "27017", required: false, default: 27017, dependsOn: { field: "connectionType", value: "direct" } },
    { name: "username", label: "Username", type: "text", placeholder: "readonly_user", required: true },
    { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: true },
    { name: "authSource", label: "Auth Database", type: "text", placeholder: "admin", required: false },
    { name: "database", label: "Database to sync", type: "text", placeholder: "production_db", required: true, description: "Populates database_includes" },
    {
      name: "tls",
      label: "Enable TLS",
      type: "select",
      required: false,
      options: [
        { value: "false", label: "Disabled" },
        { value: "true", label: "Enabled" },
      ],
    },
    {
      name: "mongo_strategy",
      label: "Strategy",
      type: "select",
      required: false,
      description: "Infer (recommended) for typed columns; Envelope or Raw for JSONB",
      options: [
        { value: "infer", label: "Infer (recommended)" },
        { value: "envelope", label: "Envelope" },
        { value: "raw", label: "Raw" },
      ],
    },
    { name: "mongo_infer_sample_size", label: "Sample size for schema inference", type: "number", placeholder: "2000", required: false, default: 2000, dependsOn: { field: "mongo_strategy", value: "infer" } },
  ],
  connectionString: false,
  testConnection: true,
};

const mongodbDestConnectionSchema: ConnectionSchema = {
  fields: [
    { name: "name", label: "Connection Name", type: "text", placeholder: "My MongoDB Destination", required: true },
    { name: "connection_string", label: "Connection String", type: "textarea", placeholder: "mongodb+srv://user:pass@cluster.mongodb.net/?authSource=admin", required: false, description: "Paste MongoDB URI from Atlas dashboard" },
    { name: "host", label: "Host", type: "text", placeholder: "cluster.mongodb.net", required: false },
    { name: "port", label: "Port", type: "number", placeholder: "27017", required: false },
    { name: "username", label: "Username", type: "text", placeholder: "user", required: false },
    { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: false },
    { name: "authSource", label: "Auth Database", type: "text", placeholder: "admin", required: false },
    { name: "database", label: "Target Database", type: "text", placeholder: "mantrixflow_dest", required: true },
    { name: "collection_suffix", label: "Collection Suffix", type: "text", placeholder: "_mxf", required: false },
    {
      name: "add_record_metadata",
      label: "Add Singer metadata fields",
      type: "checkbox",
      required: false,
    },
  ],
  connectionString: true,
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
      id: "source-mongodb",
      label: "MongoDB",
      category: "Database",
      cdc: false,
      connectionSchema: mongodbSourceConnectionSchema,
    },
  ] as ConnectorSource[],
  destinations: [
    {
      id: "postgres",
      label: "PostgreSQL",
      connectionSchema: postgresConnectionSchema,
    },
    {
      id: "destination-mongodb",
      label: "MongoDB",
      connectionSchema: mongodbDestConnectionSchema,
    },
  ] as ConnectorDestination[],
} as const;
