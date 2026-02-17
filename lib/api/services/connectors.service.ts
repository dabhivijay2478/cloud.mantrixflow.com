/**
 * Connectors API Service
 * Fetches connector metadata for dynamic connection form generation.
 */

import { ApiClient } from "../client";

export interface ConnectorFieldSchema {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "password" | "object";
  required: boolean;
  placeholder?: string;
  description?: string;
  default?: unknown;
}

export interface ConnectorMetadata {
  sourceType: string;
  displayName: string;
  requiredFields: string[];
  optionalFields: string[];
  uiSchema: ConnectorFieldSchema[];
}

export interface ConnectorsMetadataResponse {
  connectors: ConnectorMetadata[];
}

export class ConnectorsService {
  private static readonly BASE_PATH = "api/connectors";

  static async getMetadata(): Promise<ConnectorMetadata[]> {
    const result = await ApiClient.get<ConnectorsMetadataResponse>(
      `${ConnectorsService.BASE_PATH}/metadata`,
    );
    return result?.connectors ?? [];
  }
}
