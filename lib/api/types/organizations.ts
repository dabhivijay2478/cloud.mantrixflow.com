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

/**
 * Organization Member Types
 */
export type OrganizationMemberRole = 'owner' | 'admin' | 'member' | 'viewer' | 'guest';
export type OrganizationMemberStatus = 'invited' | 'accepted' | 'active' | 'inactive';

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId?: string;
  email: string;
  role: OrganizationMemberRole;
  status: OrganizationMemberStatus;
  invitedBy?: string;
  invitedAt: Date | string;
  acceptedAt?: Date | string;
  agentPanelAccess: boolean;
  allowedModels: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface InviteMemberDto {
  email: string;
  role: OrganizationMemberRole;
  agentPanelAccess?: boolean;
  allowedModels?: string[];
}

export interface UpdateMemberDto {
  role?: OrganizationMemberRole;
  agentPanelAccess?: boolean;
  allowedModels?: string[];
  status?: OrganizationMemberStatus;
}
