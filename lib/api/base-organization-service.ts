/**
 * Base Organization Service
 * Factory helpers for organization-scoped CRUD resources.
 * Use for new services; existing services can migrate gradually.
 */

import { ApiClient, type PaginatedListResult } from "./client";
import { orgPath } from "./constants";

export interface BaseOrgServiceConfig {
  resourcePath: string;
}

/**
 * Create path for organization-scoped resource
 */
export function getResourcePath(
  organizationId: string,
  resourcePath: string,
  id?: string,
): string {
  const base = `${orgPath(organizationId)}/${resourcePath}`;
  return id ? `${base}/${id}` : base;
}

/**
 * Generic list - GET list endpoint
 */
export async function listResource<T>(
  organizationId: string,
  resourcePath: string,
  params?: { limit?: number; offset?: number },
): Promise<T[]> {
  const base = `${orgPath(organizationId)}/${resourcePath}`;
  const url = params
    ? `${base}?${new URLSearchParams({
        limit: String(params.limit ?? 20),
        offset: String(params.offset ?? 0),
      })}`
    : base;
  return ApiClient.get<T[]>(url);
}

/**
 * Generic list with pagination - GET list endpoint returning PaginatedListResult
 */
export async function listResourcePaginated<T>(
  organizationId: string,
  resourcePath: string,
  limit: number = 20,
  offset: number = 0,
): Promise<PaginatedListResult<T>> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return ApiClient.getList<T>(
    `${orgPath(organizationId)}/${resourcePath}?${params}`,
  );
}

/**
 * Generic get - GET single resource
 */
export async function getResource<T>(
  organizationId: string,
  resourcePath: string,
  id: string,
): Promise<T> {
  return ApiClient.get<T>(
    getResourcePath(organizationId, resourcePath, id),
  );
}

/**
 * Generic create - POST
 */
export async function createResource<T, D>(
  organizationId: string,
  resourcePath: string,
  data: D,
): Promise<T> {
  return ApiClient.post<T>(
    getResourcePath(organizationId, resourcePath),
    data,
  );
}

/**
 * Generic update - PATCH
 */
export async function updateResource<T, D>(
  organizationId: string,
  resourcePath: string,
  id: string,
  data: D,
): Promise<T> {
  return ApiClient.patch<T>(
    getResourcePath(organizationId, resourcePath, id),
    data,
  );
}

/**
 * Generic delete - DELETE
 */
export async function deleteResource(
  organizationId: string,
  resourcePath: string,
  id: string,
): Promise<{ deletedId: string }> {
  return ApiClient.delete<{ deletedId: string }>(
    getResourcePath(organizationId, resourcePath, id),
  );
}
