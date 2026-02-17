/**
 * Transform API connector metadata to connection form schema format.
 * Maps sourceType (postgresql, mysql, mongodb) to frontend type (postgres, mysql, mongodb).
 */

import type { ConnectorMetadata } from "@/lib/api/services/connectors.service";

export type ConnectionSchemaField = {
  name: string;
  label: string;
  type: "text" | "password" | "number" | "textarea" | "select" | "checkbox" | "file";
  placeholder?: string;
  required?: boolean;
  description?: string;
  default?: unknown;
  options?: Array<{ value: string; label: string }>;
  dependsOn?: { field: string; value: string | boolean };
};

export type ConnectionSchema = {
  fields: ConnectionSchemaField[];
  connectionString?: boolean;
  testConnection?: boolean;
};

/** Map API sourceType to frontend data source type */
const SOURCE_TYPE_TO_FRONTEND: Record<string, string> = {
  postgresql: "postgres",
  mysql: "mysql",
  mongodb: "mongodb",
};

function mapApiTypeToFormType(
  apiType: string,
): ConnectionSchemaField["type"] {
  switch (apiType) {
    case "password":
      return "password";
    case "number":
      return "number";
    case "boolean":
      return "select";
    default:
      return "text";
  }
}

/**
 * Transform API ConnectorMetadata to ConnectionSchema format.
 * Adds "name" (connection name) field and maps types.
 */
export function metadataToConnectionSchema(
  metadata: ConnectorMetadata,
): ConnectionSchema {
  const nameField: ConnectionSchemaField = {
    name: "name",
    label: "Connection Name",
    type: "text",
    required: true,
    placeholder: `My ${metadata.displayName} Connection`,
    description: "A friendly name to identify this connection",
  };

  const fields: ConnectionSchemaField[] = [
    nameField,
    ...metadata.uiSchema.map((f) => ({
      name: f.key,
      label: f.label,
      type: mapApiTypeToFormType(f.type),
      placeholder: f.placeholder,
      required: f.required,
      description: f.description,
      default: f.default,
      options:
        f.type === "boolean"
          ? [
              { value: "false", label: "Disabled" },
              { value: "true", label: "Enabled" },
            ]
          : undefined,
    })),
  ];

  const hasConnectionString = metadata.optionalFields.includes(
    "connection_string",
  );

  return {
    fields,
    connectionString: hasConnectionString,
    testConnection: true,
  };
}

/**
 * Build a map of frontend type -> ConnectionSchema from API metadata.
 * Use for connectionSchemasOverride in ConnectionSheet.
 */
export function buildConnectionSchemasFromMetadata(
  connectors: ConnectorMetadata[],
): Record<string, ConnectionSchema> {
  const map: Record<string, ConnectionSchema> = {};
  for (const meta of connectors) {
    const frontendType = SOURCE_TYPE_TO_FRONTEND[meta.sourceType];
    if (frontendType) {
      map[frontendType] = metadataToConnectionSchema(meta);
    }
  }
  return map;
}
