/**
 * Organizations API Types
 * Type definitions for organization endpoints
 */

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateOrganizationDto {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  slug?: string;
  description?: string;
}
