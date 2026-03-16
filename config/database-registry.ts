/**
 * MANTrixFlow Database Registry
 * Single source of truth for all database types in the connections feature.
 * Wave 1 only for now; add entries with wave: 2 or 3 for future extensibility.
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

export interface DatabaseRegistryEntry {
  id: string;
  displayName: string;
  icon: string;
  defaultPort: number;
  source: boolean;
  dest: boolean;
  dltSourceModule?: string;
  dltDestModule?: string;
  wave: 1 | 2 | 3;
  sslModes: string[];
  showSchema: boolean;
  cdcCapable: boolean;
  credentialFields: ConnectionField[];
  notes?: string;
}

const WAVE_1 = 1;

// Shared field definitions
const nameField = (placeholder: string): ConnectionField => ({
  name: "name",
  label: "Connection Name",
  type: "text",
  placeholder,
  required: true,
});

const hostField = (label = "Host", placeholder = "localhost or db.example.com"): ConnectionField => ({
  name: "host",
  label,
  type: "text",
  placeholder,
  required: true,
});

const portField = (placeholder: string, defaultVal: number): ConnectionField => ({
  name: "port",
  label: "Port",
  type: "number",
  placeholder,
  required: true,
  default: defaultVal,
});

const databaseField = (placeholder: string): ConnectionField => ({
  name: "database",
  label: "Database",
  type: "text",
  placeholder,
  required: true,
});

const usernameField = (placeholder: string): ConnectionField => ({
  name: "username",
  label: "Username",
  type: "text",
  placeholder,
  required: true,
});

const passwordField: ConnectionField = {
  name: "password",
  label: "Password",
  type: "password",
  placeholder: "••••••••",
  required: true,
};

const schemaField = (defaultSchema: string): ConnectionField => ({
  name: "schema",
  label: "Schema",
  type: "text",
  placeholder: defaultSchema,
  required: false,
});

// PostgreSQL: schema, SSL modes
const postgresFields: ConnectionField[] = [
  nameField("My PostgreSQL Connection"),
  hostField("Host", "localhost or db.example.com"),
  portField("5432", 5432),
  databaseField("postgres"),
  schemaField("public"),
  usernameField("postgres"),
  passwordField,
  {
    name: "ssl_mode",
    label: "SSL Mode",
    type: "select",
    placeholder: "Select SSL mode",
    required: false,
    options: [
      { value: "disable", label: "Disable" },
      { value: "require", label: "Require" },
      { value: "verify-ca", label: "Verify CA" },
      { value: "verify-full", label: "Verify Full" },
    ],
  },
];

// MySQL / MariaDB: no schema, SSL toggle
const mysqlFields: ConnectionField[] = [
  nameField("My MySQL Connection"),
  hostField("Host", "localhost or db.example.com"),
  portField("3306", 3306),
  databaseField("mydb"),
  usernameField("user"),
  passwordField,
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
];

// MSSQL: schema dbo, ODBC note
const mssqlFields: ConnectionField[] = [
  nameField("My SQL Server Connection"),
  hostField("Server", "localhost or server.database.windows.net"),
  portField("1433", 1433),
  databaseField("mydb"),
  schemaField("dbo"),
  usernameField("user"),
  passwordField,
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
];

// Oracle: Service Name / SID
const oracleFields: ConnectionField[] = [
  nameField("My Oracle Connection"),
  hostField("Host", "localhost"),
  portField("1521", 1521),
  {
    name: "database",
    label: "Service Name / SID",
    type: "text",
    placeholder: "ORCL",
    required: true,
  },
  usernameField("user"),
  passwordField,
];

// SQLite: file path only
const sqliteFields: ConnectionField[] = [
  nameField("My SQLite Connection"),
  {
    name: "path",
    label: "File Path",
    type: "text",
    placeholder: "/path/to/database.sqlite3",
    required: true,
    description: "Absolute path to the .sqlite3 file on the ETL server",
  },
];

// CockroachDB: schema, SSL require
const cockroachFields: ConnectionField[] = [
  nameField("My CockroachDB Connection"),
  hostField("Host", "localhost or cluster.cockroachlabs.cloud"),
  portField("26257", 26257),
  databaseField("defaultdb"),
  schemaField("public"),
  usernameField("user"),
  passwordField,
  {
    name: "ssl_mode",
    label: "SSL Mode",
    type: "select",
    required: false,
    options: [{ value: "require", label: "Require" }],
  },
];

export const DATABASE_REGISTRY: DatabaseRegistryEntry[] = [
  {
    id: "postgres",
    displayName: "PostgreSQL",
    icon: "postgres",
    defaultPort: 5432,
    source: true,
    dest: true,
    dltSourceModule: "dlt.sources.sql_database",
    dltDestModule: "dlt.destinations.postgres",
    wave: 1,
    sslModes: ["disable", "require", "verify-ca", "verify-full"],
    showSchema: true,
    cdcCapable: true,
    credentialFields: postgresFields,
  },
  {
    id: "mysql",
    displayName: "MySQL",
    icon: "mysql",
    defaultPort: 3306,
    source: true,
    dest: true,
    dltSourceModule: "dlt.sources.sql_database",
    dltDestModule: "dlt.destinations.sqlalchemy",
    wave: 1,
    sslModes: ["disabled", "required"],
    showSchema: false,
    cdcCapable: false,
    credentialFields: mysqlFields,
  },
  {
    id: "mariadb",
    displayName: "MariaDB",
    icon: "mariadb",
    defaultPort: 3306,
    source: true,
    dest: true,
    dltSourceModule: "dlt.sources.sql_database",
    dltDestModule: "dlt.destinations.sqlalchemy",
    wave: 1,
    sslModes: ["disabled", "required"],
    showSchema: false,
    cdcCapable: false,
    credentialFields: mysqlFields,
  },
  {
    id: "mssql",
    displayName: "SQL Server",
    icon: "mssql",
    defaultPort: 1433,
    source: true,
    dest: true,
    dltSourceModule: "dlt.sources.sql_database",
    dltDestModule: "dlt.destinations.mssql",
    wave: 1,
    sslModes: ["disabled", "required"],
    showSchema: true,
    cdcCapable: false,
    credentialFields: mssqlFields,
    notes: "Requires ODBC Driver 17 for SQL Server installed on the ETL server",
  },
  {
    id: "oracle",
    displayName: "Oracle",
    icon: "oracle",
    defaultPort: 1521,
    source: true,
    dest: true,
    dltSourceModule: "dlt.sources.sql_database",
    dltDestModule: "dlt.destinations.sqlalchemy",
    wave: 1,
    sslModes: ["disabled", "required"],
    showSchema: false,
    cdcCapable: false,
    credentialFields: oracleFields,
  },
  {
    id: "sqlite",
    displayName: "SQLite",
    icon: "sqlite",
    defaultPort: 0,
    source: true,
    dest: true,
    dltSourceModule: "dlt.sources.sql_database",
    dltDestModule: "dlt.destinations.sqlalchemy",
    wave: 1,
    sslModes: [],
    showSchema: false,
    cdcCapable: false,
    credentialFields: sqliteFields,
  },
  {
    id: "cockroachdb",
    displayName: "CockroachDB",
    icon: "cockroachdb",
    defaultPort: 26257,
    source: true,
    dest: true,
    dltSourceModule: "dlt.sources.sql_database",
    dltDestModule: "dlt.destinations.sqlalchemy",
    wave: 1,
    sslModes: ["require"],
    showSchema: true,
    cdcCapable: false,
    credentialFields: cockroachFields,
  },
];

/** Get databases available for the given wave. Wave 1 = available now. */
export function getAvailableDatabases(wave: number = WAVE_1): DatabaseRegistryEntry[] {
  return DATABASE_REGISTRY.filter((e) => e.wave <= wave);
}

/** Get registry entry by id */
export function getDatabaseById(id: string): DatabaseRegistryEntry | undefined {
  return DATABASE_REGISTRY.find((e) => e.id === id);
}

/** Badge from registry: Source & Dest | Source only | Dest only */
export function getAvailabilityBadge(entry: DatabaseRegistryEntry): {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
} {
  if (entry.source && entry.dest) {
    return { label: "Source & Dest", variant: "default" };
  }
  if (entry.source && !entry.dest) {
    return { label: "Source only", variant: "secondary" };
  }
  return { label: "Dest only", variant: "outline" };
}
