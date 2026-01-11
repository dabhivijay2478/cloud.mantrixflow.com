/**
 * AUTHORITATIVE ROLES - Must match backend enum
 * These roles are enforced server-side and are the single source of truth
 */
export type TeamMemberRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

export const roleConfig: Record<
  TeamMemberRole,
  {
    label: string;
    description: string;
  }
> = {
  OWNER: {
    label: "Owner",
    description: "Full access: Update org details, invite/remove users, change roles, manage all data",
  },
  ADMIN: {
    label: "Admin",
    description: "Can manage workspace data, data sources, pipelines, and users. Cannot update org details or change ownership",
  },
  EDITOR: {
    label: "Editor",
    description: "Can edit workspace data, manage data sources and pipelines. Cannot manage users or org settings",
  },
  VIEWER: {
    label: "Viewer",
    description: "Read-only access. Can view all data but cannot edit anything",
  },
};
