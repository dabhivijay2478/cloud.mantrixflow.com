"use client";

import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Calendar,
  Check,
  Crown,
  Loader2,
  Mail,
  Shield,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type TeamMemberRole = "owner" | "admin" | "member" | "viewer" | "guest";

const roleConfig: Record<
  TeamMemberRole,
  {
    label: string;
    icon: typeof Shield;
    color: string;
    bgColor: string;
    description: string;
    permissions: string[];
  }
> = {
  owner: {
    label: "Owner",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-500",
    description: "Full access to all features and settings",
    permissions: [
      "Manage billing",
      "Delete organization",
      "All admin permissions",
    ],
  },
  admin: {
    label: "Admin",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-500",
    description: "Manage team members and organization settings",
    permissions: ["Invite members", "Manage roles", "Organization settings"],
  },
  member: {
    label: "Member",
    icon: User,
    color: "text-green-600",
    bgColor: "bg-green-500",
    description: "Create and edit dashboards and data sources",
    permissions: ["Create dashboards", "Edit content", "Connect data sources"],
  },
  viewer: {
    label: "Viewer",
    icon: User,
    color: "text-gray-600",
    bgColor: "bg-gray-500",
    description: "View-only access to dashboards",
    permissions: ["View dashboards", "Export data", "Basic reporting"],
  },
  guest: {
    label: "Guest",
    icon: User,
    color: "text-orange-600",
    bgColor: "bg-orange-500",
    description: "Limited access to specific resources",
    permissions: ["View specific dashboards", "Limited time access"],
  },
};

const availableModels = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Most capable model",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Fast and efficient",
  },
  {
    id: "claude-opus-4-20250514",
    name: "Claude 4 Opus",
    provider: "Anthropic",
    description: "Best for complex tasks",
  },
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude 4 Sonnet",
    provider: "Anthropic",
    description: "Balanced performance",
  },
  {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    description: "Lightning fast",
  },
];

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

const mockMembers: TeamMember[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "owner",
    avatar: null,
    status: "active",
    joinedAt: "2024-01-15",
    agentPanelAccess: true,
    allowedModels: ["gpt-4o", "claude-opus-4-20250514", "gemini-2.0-flash-exp"],
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
];

export default function EditTeamMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState<TeamMember | null>(null);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<TeamMemberRole>("member");
  const [editAgentPanelAccess, setEditAgentPanelAccess] = useState(false);
  const [editAllowedModels, setEditAllowedModels] = useState<string[]>([]);

  useEffect(() => {
    const foundMember = mockMembers.find((m) => m.id === memberId);
    if (foundMember) {
      setMember(foundMember);
      setEditName(foundMember.name);
      setEditEmail(foundMember.email);
      setEditRole(foundMember.role);
      setEditAgentPanelAccess(foundMember.agentPanelAccess || false);
      setEditAllowedModels(foundMember.allowedModels || []);
    } else {
      toast.error("Team member not found");
      router.push("/workspace/team");
    }
  }, [memberId, router]);

  const toggleModelPermission = (modelId: string) => {
    if (editAllowedModels.includes(modelId)) {
      setEditAllowedModels(editAllowedModels.filter((id) => id !== modelId));
    } else {
      setEditAllowedModels([...editAllowedModels, modelId]);
    }
  };

  const getStatusBadge = (status: TeamMember["status"]) => {
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-xs font-medium",
          status === "active" &&
            "border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950",
          status === "pending" &&
            "border-yellow-500/50 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950",
          status === "inactive" &&
            "border-gray-500/50 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950",
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full mr-1.5 inline-block",
            status === "active" && "bg-green-500",
            status === "pending" && "bg-yellow-500",
            status === "inactive" && "bg-gray-500",
          )}
        />
        {status === "active" && "Active"}
        {status === "pending" && "Pending"}
        {status === "inactive" && "Inactive"}
      </Badge>
    );
  };

  const handleSave = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editAgentPanelAccess && editAllowedModels.length === 0) {
      toast.error(
        "Please select at least one model if agent panel access is enabled",
      );
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Team member updated successfully");
      router.push("/workspace/team");
    } catch {
      toast.error("Failed to update team member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (
      confirm(
        "Are you sure you want to remove this team member? This action cannot be undone.",
      )
    ) {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success("Team member removed successfully");
        router.push("/workspace/team");
      } catch {
        toast.error("Failed to remove team member");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading member details...</p>
        </div>
      </div>
    );
  }

  const selectedRoleConfig = roleConfig[editRole];
  const RoleIcon = selectedRoleConfig.icon;

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-4xl">
      <PageHeader
        title="Edit Team Member"
        description="Update team member information, role, and permissions"
        backButton={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/workspace/team")}
            className="-ml-2 hover:bg-accent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Member Profile Card */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Member Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-background shadow-lg ring-2 ring-primary/10">
                <AvatarImage src={member.avatar || undefined} />
                <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  {getStatusBadge(member.status)}
                </div>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {member.email}
                  </div>
                  {member.joinedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Joined{" "}
                      {new Date(member.joinedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Update the member's name and email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="edit-name"
                className="text-sm font-medium flex items-center gap-2"
              >
                Full Name
                <span className="text-destructive text-xs">*</span>
              </Label>
              <Input
                id="edit-name"
                type="text"
                placeholder="John Doe"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-11 text-base"
                disabled={loading}
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="edit-email"
                className="text-sm font-medium flex items-center gap-2"
              >
                Email Address
                <span className="text-destructive text-xs">*</span>
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="john@example.com"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="h-11 text-base"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Role & Permissions Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Role & Permissions
            </CardTitle>
            <CardDescription>
              Assign a role to define access level and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="edit-role-select"
                className="text-sm font-medium flex items-center gap-2"
              >
                Member Role
                <span className="text-destructive text-xs">*</span>
              </Label>
              <Select
                value={editRole}
                onValueChange={(value) => setEditRole(value as TeamMemberRole)}
                disabled={loading}
              >
                <SelectTrigger id="edit-role-select" className="h-12 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[400px]">
                    {Object.entries(roleConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem
                          key={key}
                          value={key}
                          className="py-3 cursor-pointer"
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div
                              className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
                                config.bgColor,
                                "text-white",
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-semibold">
                                {config.label}
                              </span>
                              <span className="text-xs text-muted-foreground mt-0.5">
                                {config.description}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </ScrollArea>
                </SelectContent>
              </Select>

              {/* Selected Role Preview */}
              <div className="p-4 rounded-xl border-2 bg-accent/50">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
                      selectedRoleConfig.bgColor,
                      "text-white",
                    )}
                  >
                    <RoleIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base">
                      {selectedRoleConfig.label}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {selectedRoleConfig.description}
                    </div>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Permissions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoleConfig.permissions.map((permission) => (
                      <Badge
                        key={permission}
                        variant="secondary"
                        className="text-xs"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Panel Access Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Agent Panel Access
                  <Badge variant="outline" className="ml-2">
                    Optional
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Grant access to AI-powered dashboard generation tools
                </CardDescription>
              </div>
              <Switch
                id="agent-panel-access"
                checked={editAgentPanelAccess}
                onCheckedChange={setEditAgentPanelAccess}
                disabled={loading}
              />
            </div>
          </CardHeader>

          {editAgentPanelAccess && (
            <CardContent className="space-y-4 pt-0">
              <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-primary">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">Select AI Models</p>
                    <p className="text-xs text-muted-foreground">
                      Choose which AI models this member can use for generating
                      dashboards
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {availableModels.map((model) => {
                  const isSelected = editAllowedModels.includes(model.id);
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => toggleModelPermission(model.id)}
                      className={cn(
                        "group relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all w-full text-left hover:shadow-md",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50 hover:bg-accent/50",
                      )}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={cn(
                            "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0",
                            isSelected
                              ? "border-primary bg-primary shadow-sm"
                              : "border-muted-foreground/30 group-hover:border-primary/50",
                          )}
                        >
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold">
                              {model.name}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {model.provider}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {model.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {editAllowedModels.length === 0 && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                        No models selected
                      </p>
                      <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80">
                        Please select at least one model to enable agent panel
                        access
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {editAllowedModels.length > 0 && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                        {editAllowedModels.length} model
                        {editAllowedModels.length !== 1 ? "s" : ""} selected
                      </p>
                      <p className="text-xs text-green-600/80 dark:text-green-400/80">
                        Member will have access to the selected AI models
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Action Buttons */}
        <Card className="border-2 bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Button
                  variant="destructive"
                  onClick={handleRemoveMember}
                  disabled={loading || member.role === "owner"}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Member
                </Button>
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/workspace/team")}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={
                      loading ||
                      !editName.trim() ||
                      !editEmail.trim() ||
                      (editAgentPanelAccess && editAllowedModels.length === 0)
                    }
                    className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {member.role === "owner" && (
                <p className="text-xs text-muted-foreground text-center sm:text-right">
                  Organization owners cannot be removed. Transfer ownership
                  first.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
