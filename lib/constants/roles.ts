export type TeamMemberRole = "owner" | "admin" | "member" | "viewer" | "guest";

export const roleConfig: Record<
  TeamMemberRole,
  {
    label: string;
    description: string;
  }
> = {
  owner: {
    label: "Owner",
    description: "Full access to all features and settings",
  },
  admin: {
    label: "Admin",
    description: "Can manage workspace settings",
  },
  member: {
    label: "Member",
    description: "Can view and send emails",
  },
  viewer: {
    label: "Viewer",
    description: "Can view dashboards only",
  },
  guest: {
    label: "Guest",
    description: "Limited access to specific resources",
  },
};
