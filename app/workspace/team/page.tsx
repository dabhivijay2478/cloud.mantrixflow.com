"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Shield,
  User,
  Crown,
  Trash2,
  Edit,
  Bot,
  X,
  UserPlus,
  Check,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TeamMemberRole = "owner" | "admin" | "member" | "viewer" | "guest";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  avatar: string | null;
  status: "active" | "pending" | "inactive";
  joinedAt?: string;
  agentPanelAccess?: boolean;
  allowedModels?: string[];
}

const roleConfig: Record<
  TeamMemberRole,
  { label: string; icon: typeof Shield; color: string; description: string }
> = {
  owner: {
    label: "Owner",
    icon: Crown,
    color: "bg-purple-500",
    description: "Full access to all features and settings",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    color: "bg-blue-500",
    description: "Manage team members and organization settings",
  },
  member: {
    label: "Member",
    icon: User,
    color: "bg-green-500",
    description: "Create and edit dashboards and data sources",
  },
  viewer: {
    label: "Viewer",
    icon: User,
    color: "bg-gray-500",
    description: "View-only access to dashboards",
  },
  guest: {
    label: "Guest",
    icon: User,
    color: "bg-orange-500",
    description: "Limited access to specific resources",
  },
};

export default function TeamPage() {
  const router = useRouter();

  // Mock team members - in a real app, this would come from the store/API
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "owner",
      avatar: null,
      status: "active",
      joinedAt: "2024-01-15",
      agentPanelAccess: true,
      allowedModels: [
        "gpt-4o",
        "claude-opus-4-20250514",
        "gemini-2.0-flash-exp",
      ],
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "admin",
      avatar: null,
      status: "active",
      joinedAt: "2024-02-20",
      agentPanelAccess: true,
      allowedModels: ["gpt-4o", "gpt-4o-mini"],
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "member",
      avatar: null,
      status: "active",
      joinedAt: "2024-03-10",
      agentPanelAccess: true,
      allowedModels: ["gpt-4o-mini"],
    },
    {
      id: "4",
      name: "Alice Williams",
      email: "alice@example.com",
      role: "viewer",
      avatar: null,
      status: "pending",
      joinedAt: "2024-04-05",
      agentPanelAccess: false,
      allowedModels: [],
    },
    {
      id: "5",
      name: "Charlie Brown",
      email: "charlie@example.com",
      role: "guest",
      avatar: null,
      status: "active",
      joinedAt: "2024-04-12",
      agentPanelAccess: false,
      allowedModels: [],
    },
  ]);

  const handleRoleChange = (memberId: string, newRole: TeamMemberRole) => {
    setTeamMembers(
      teamMembers.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member,
      ),
    );
    toast.success("Role updated successfully");
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
      toast.success("Team member removed");
    }
  };

  const handleEditClick = (member: TeamMember) => {
    router.push(`/workspace/team/${member.id}/edit`);
  };

  const getRoleBadge = (role: TeamMemberRole) => {
    const config = roleConfig[role];
    const Icon = config.icon;
    return (
      <Badge
        variant="outline"
        className={cn(
          "flex items-center gap-1.5 px-2 py-1",
          role === "owner" &&
            "border-purple-500/50 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950",
          role === "admin" &&
            "border-blue-500/50 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950",
          role === "member" &&
            "border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950",
          role === "viewer" &&
            "border-gray-500/50 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950",
          role === "guest" &&
            "border-orange-500/50 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950",
        )}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: TeamMember["status"]) => {
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-xs",
          status === "active" &&
            "border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950",
          status === "pending" &&
            "border-yellow-500/50 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950",
          status === "inactive" &&
            "border-gray-500/50 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950",
        )}
      >
        {status === "active" && "Active"}
        {status === "pending" && "Pending"}
        {status === "inactive" && "Inactive"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and permissions
          </p>
        </div>
        <Button
          onClick={() => router.push("/workspace/team/invite")}
          className="w-full sm:w-auto"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {teamMembers.length}{" "}
                {teamMembers.length === 1 ? "member" : "members"} in your
                organization
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Member</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Role</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Agent Panel
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <User className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No team members yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Invite team members to get started
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  teamMembers.map((member) => {
                    const roleInfo = roleConfig[member.role];
                    const RoleIcon = roleInfo.icon;
                    return (
                      <TableRow key={member.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatar || undefined} />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <div className="font-medium truncate">
                                {member.name}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{member.email}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getStatusBadge(member.status)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 hover:bg-transparent"
                              >
                                {getRoleBadge(member.role)}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                              <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {Object.entries(roleConfig).map(
                                ([key, config]) => {
                                  const Icon = config.icon;
                                  return (
                                    <DropdownMenuItem
                                      key={key}
                                      onClick={() =>
                                        handleRoleChange(
                                          member.id,
                                          key as TeamMemberRole,
                                        )
                                      }
                                      className={cn(
                                        "flex items-center gap-2",
                                        member.role === key && "bg-accent",
                                      )}
                                    >
                                      <Icon className="h-4 w-4" />
                                      <div className="flex flex-col flex-1">
                                        <span>{config.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {config.description}
                                        </span>
                                      </div>
                                      {member.role === key && (
                                        <Check className="h-4 w-4 ml-auto" />
                                      )}
                                    </DropdownMenuItem>
                                  );
                                },
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            {member.agentPanelAccess ? (
                              <Badge
                                variant="outline"
                                className="border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950"
                              >
                                <Bot className="h-3 w-3 mr-1" />
                                Enabled
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-gray-500/50 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Disabled
                              </Badge>
                            )}
                            {member.agentPanelAccess &&
                              member.allowedModels &&
                              member.allowedModels.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ({member.allowedModels.length} model
                                  {member.allowedModels.length !== 1 ? "s" : ""}
                                  )
                                </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {member.joinedAt
                            ? new Date(member.joinedAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="lg:hidden">
                              {getStatusBadge(member.status)}
                            </div>
                            <div className="lg:hidden">
                              {getRoleBadge(member.role)}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleEditClick(member)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Member
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
