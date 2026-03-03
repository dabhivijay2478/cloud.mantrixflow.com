/**
 * API path constants
 * Shared across all organization-scoped services
 */

export const BASE_PATH = "api/organizations";

/**
 * Get organization-scoped API path
 * e.g. orgPath("org-123") => "api/organizations/org-123"
 */
export const orgPath = (orgId: string): string => `${BASE_PATH}/${orgId}`;

/**
 * Default transform type for pipeline destination schemas.
 * Uses dlt (data load tool) - no dbt or custom SQL required.
 */
export const DEFAULT_DESTINATION_TRANSFORM_TYPE = "dlt" as const;
