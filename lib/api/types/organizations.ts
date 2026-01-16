/**
 * Organizations API Types
 * Type definitions for organization endpoints (updated for new schema)
 */

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_user_id: string; // This identifies the owner (replaces organization_owners table)
  is_active: boolean;
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  members?: OrganizationMember[];
  // Legacy fields for backward compatibility
  isOwner?: boolean;
  role?: OrganizationMemberRole;
  createdAt?: string;
  updatedAt?: string;
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

export interface TransferOwnershipDto {
  newOwnerId: string;
}

/**
 * Organization Member Types
 * AUTHORITATIVE ROLES - Must match backend enum
 */
export type OrganizationMemberRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
export type OrganizationMemberStatus =
  | "invited"
  | "accepted"
  | "active"
  | "inactive"
  | "suspended";

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id?: string;
  email: string;
  role: OrganizationMemberRole;
  status: OrganizationMemberStatus;
  invited_by?: string;
  invited_at: string;
  accepted_at?: string;
  agent_panel_access: boolean;
  allowed_models: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Legacy fields
  organizationId?: string;
  userId?: string;
  invitedAt?: string;
  acceptedAt?: string;
  agentPanelAccess?: boolean;
  allowedModels?: string[];
  createdAt?: string;
  updatedAt?: string;
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
