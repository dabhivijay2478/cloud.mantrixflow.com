export type FieldType =
  | "text"
  | "password"
  | "number"
  | "select"
  | "textarea";

export interface FieldOption {
  value: string;
  label: string;
}

export interface ConnectionFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: string | number;
  required?: boolean;
  options?: FieldOption[];
  gridCol?: "full" | "half" | "third";
}

export interface ConnectorFieldConfig {
  connectorId: string;
  fields: ConnectionFieldConfig[];
}

const SSL_OPTIONS: FieldOption[] = [
  { value: "disable", label: "Disable" },
  { value: "allow", label: "Allow" },
  { value: "prefer", label: "Prefer" },
  { value: "require", label: "Require" },
  { value: "verify-ca", label: "Verify CA" },
  { value: "verify-full", label: "Verify Full" },
];

export const CONNECTION_FIELDS: ConnectorFieldConfig[] = [
  {
    connectorId: "postgres",
    fields: [
      {
        name: "connectionName",
        label: "Connection Name",
        type: "text",
        placeholder: "Production Postgres",
        required: true,
        gridCol: "full",
      },
      {
        name: "host",
        label: "Host",
        type: "text",
        placeholder: "db.company.com",
        required: true,
        gridCol: "full",
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        placeholder: "5432",
        defaultValue: 5432,
        gridCol: "half",
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        placeholder: "mydb",
        required: true,
        gridCol: "half",
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "readonly_user",
        required: true,
        gridCol: "full",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: true,
        gridCol: "full",
      },
      {
        name: "schema",
        label: "Schema",
        type: "text",
        placeholder: "public",
        defaultValue: "public",
        gridCol: "half",
      },
      {
        name: "sslMode",
        label: "SSL Mode",
        type: "select",
        options: SSL_OPTIONS,
        defaultValue: "require",
        gridCol: "half",
      },
    ],
  },
  {
    connectorId: "mysql",
    fields: [
      {
        name: "connectionName",
        label: "Connection Name",
        type: "text",
        placeholder: "Analytics MySQL",
        required: true,
        gridCol: "full",
      },
      {
        name: "host",
        label: "Host",
        type: "text",
        placeholder: "analytics.company.com",
        required: true,
        gridCol: "full",
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        placeholder: "3306",
        defaultValue: 3306,
        gridCol: "half",
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        placeholder: "reporting",
        required: true,
        gridCol: "half",
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "readonly_user",
        required: true,
        gridCol: "full",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: true,
        gridCol: "full",
      },
      {
        name: "sslMode",
        label: "SSL Mode",
        type: "select",
        options: SSL_OPTIONS,
        defaultValue: "require",
        gridCol: "full",
      },
    ],
  },
  {
    connectorId: "mariadb",
    fields: [
      {
        name: "connectionName",
        label: "Connection Name",
        type: "text",
        required: true,
        gridCol: "full",
      },
      {
        name: "host",
        label: "Host",
        type: "text",
        required: true,
        gridCol: "full",
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        defaultValue: 3306,
        gridCol: "half",
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        required: true,
        gridCol: "half",
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        required: true,
        gridCol: "full",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        gridCol: "full",
      },
    ],
  },
  {
    connectorId: "mssql",
    fields: [
      {
        name: "connectionName",
        label: "Connection Name",
        type: "text",
        required: true,
        gridCol: "full",
      },
      {
        name: "host",
        label: "Host",
        type: "text",
        required: true,
        gridCol: "full",
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        defaultValue: 1433,
        gridCol: "half",
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        required: true,
        gridCol: "half",
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        required: true,
        gridCol: "full",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        gridCol: "full",
      },
    ],
  },
  {
    connectorId: "oracle",
    fields: [
      {
        name: "connectionName",
        label: "Connection Name",
        type: "text",
        required: true,
        gridCol: "full",
      },
      {
        name: "host",
        label: "Host",
        type: "text",
        required: true,
        gridCol: "full",
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        defaultValue: 1521,
        gridCol: "half",
      },
      {
        name: "database",
        label: "Service Name",
        type: "text",
        required: true,
        gridCol: "half",
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        required: true,
        gridCol: "full",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        gridCol: "full",
      },
    ],
  },
  {
    connectorId: "sqlite",
    fields: [
      {
        name: "connectionName",
        label: "Connection Name",
        type: "text",
        required: true,
        gridCol: "full",
      },
      {
        name: "filePath",
        label: "Database File Path",
        type: "text",
        placeholder: "/path/to/database.db",
        required: true,
        gridCol: "full",
      },
    ],
  },
  {
    connectorId: "cockroachdb",
    fields: [
      {
        name: "connectionName",
        label: "Connection Name",
        type: "text",
        required: true,
        gridCol: "full",
      },
      {
        name: "host",
        label: "Host",
        type: "text",
        required: true,
        gridCol: "full",
      },
      {
        name: "port",
        label: "Port",
        type: "number",
        defaultValue: 26257,
        gridCol: "half",
      },
      {
        name: "database",
        label: "Database",
        type: "text",
        defaultValue: "defaultdb",
        gridCol: "half",
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        required: true,
        gridCol: "full",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        gridCol: "full",
      },
    ],
  },
];

export function getFieldsForConnector(connectorId: string): ConnectionFieldConfig[] {
  const config = CONNECTION_FIELDS.find((c) => c.connectorId === connectorId);
  return config?.fields ?? [];
}
