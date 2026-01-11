/**
 * Global Search API Service
 * Service layer for global search endpoints
 */

import { ApiClient } from "../client";

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  redirect: string;
  filterKey: string;
  filterValue: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}

export interface SearchRequest {
  organizationId: string;
  query: string;
  limit?: number;
}

export class SearchService {
  private static readonly BASE_PATH = "api/search";

  static async search(
    request: SearchRequest,
    options?: { token?: string | null },
  ): Promise<SearchResponse> {
    const params = new URLSearchParams({
      organizationId: request.organizationId,
      query: request.query,
    });

    if (request.limit) {
      params.append("limit", request.limit.toString());
    }

    return ApiClient.get<SearchResponse>(
      `${SearchService.BASE_PATH}?${params.toString()}`,
      {
        token: options?.token,
      },
    );
  }
}
