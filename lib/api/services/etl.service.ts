/**
 * ETL API Service
 * Proxies ETL operations through NestJS (never call ETL server directly).
 *
 * NestJS EtlController at /etl proxies to the PyAirbyte ETL server.
 * Connections CRUD goes through NestJS data-sources/connection endpoints.
 */

import { ApiClient } from "../client";

export interface EtlConnectorSource {
  id: string;
  type?: string;
  label: string;
  category?: string;
  cdc?: boolean;
}

export interface EtlConnectorsResponse {
  sources: EtlConnectorSource[];
  destinations: Array<{ id: string; label: string }>;
}

export interface EtlCdcSetupResponse {
  source_type: string;
  cdc_supported: boolean;
  setup?: { title: string; steps: string[] };
}

export class EtlService {
  private static readonly BASE_PATH = "api/etl";

  static async testConnection(body: {
    source_type: string;
    source_config: Record<string, unknown>;
  }): Promise<{ success: boolean; message?: string }> {
    return ApiClient.post(`${EtlService.BASE_PATH}/test-connection`, body);
  }

  static async discover(body: {
    source_type: string;
    source_config: Record<string, unknown>;
  }): Promise<{ source_type: string; streams: Array<{ name: string; columns: string[] }>; total: number }> {
    return ApiClient.post(`${EtlService.BASE_PATH}/discover`, body);
  }

  static async preview(body: {
    source_type: string;
    source_config: Record<string, unknown>;
    source_stream?: string;
    limit?: number;
  }): Promise<{ records: Record<string, unknown>[]; columns: string[]; total: number }> {
    return ApiClient.post(`${EtlService.BASE_PATH}/preview`, body);
  }

  static async collect(body: Record<string, unknown>): Promise<Record<string, unknown>> {
    return ApiClient.post(`${EtlService.BASE_PATH}/collect`, body);
  }

  static async emit(body: Record<string, unknown>): Promise<Record<string, unknown>> {
    return ApiClient.post(`${EtlService.BASE_PATH}/emit`, body);
  }

  static async transform(body: Record<string, unknown>): Promise<Record<string, unknown>> {
    return ApiClient.post(`${EtlService.BASE_PATH}/transform`, body);
  }

  static async listConnectors(): Promise<EtlConnectorsResponse> {
    return ApiClient.get(`${EtlService.BASE_PATH}/connectors`);
  }

  static async getCdcSetup(sourceType: string): Promise<EtlCdcSetupResponse> {
    return ApiClient.get(
      `${EtlService.BASE_PATH}/connectors/${encodeURIComponent(sourceType)}/cdc-setup`,
    );
  }

  static async health(): Promise<{ status: string }> {
    return ApiClient.get(`${EtlService.BASE_PATH}/health`);
  }
}
