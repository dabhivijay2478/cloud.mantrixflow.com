"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Edit, Mail, Loader2, Bot, Sparkles, AlertCircle, Check, Shield, User, Crown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TeamMemberRole = "owner" | "admin" | "member" | "viewer" | "guest";

const roleConfig: Record<TeamMemberRole, { label: string; icon: typeof Shield; color: string; description: string }> = {
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

const availableModels = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  { id: "claude-opus-4-20250514", name: "Claude 4 Opus", provider: "Anthropic" },
  { id: "claude-sonnet-4-20250514", name: "Claude 4 Sonnet", provider: "Anthropic" },
  { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", provider: "Google" },
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

// Mock data - in a real app, this would come from an API
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
    // In a real app, this would fetch from an API
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
          "text-xs",
          status === "active" && "border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950",
          status === "pending" && "border-yellow-500/50 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950",
          status === "inactive" && "border-gray-500/50 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950"
        )}
      >
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
      toast.error("Please select at least one model if agent panel access is enabled");
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Team member updated successfully");
      router.push("/workspace/team");
    } catch (error) {
      toast.error("Failed to update team member");
    } finally {
      setLoading(false);
    }
  };

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Team Member</h1>
          <p className="text-muted-foreground">Update team member information, role, and permissions</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Member Preview */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <Avatar className="h-16 w-16">
            <AvatarImage src={member.avatar || undefined} />
            <AvatarFallback className="text-lg">
              {member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-lg">{member.name}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {member.email}
            </div>
            <div className="mt-2">
              {getStatusBadge(member.status)}
            </div>
          </div>
        </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-base font-semibold">
                    Full Name
                    <span className="text-destructive">*</span>
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

                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-base font-semibold">
                    Email Address
                    <span className="text-destructive">*</span>
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

                <div className="space-y-2">
                  <Label htmlFor="edit-role-select" className="text-base font-semibold">
                    Role
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select value={editRole} onValueChange={(value) => setEditRole(value as TeamMemberRole)} disabled={loading}>
                    <SelectTrigger id="edit-role-select" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-[300px]">
                        {Object.entries(roleConfig).map(([key, config]) => {
                          const Icon = config.icon;
                          return (
                            <SelectItem key={key} value={key} className="py-2">
                              <div className="flex items-start gap-3 w-full">
                                <div className={cn("h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0", config.color, "text-white")}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="font-medium">{config.label}</span>
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
                </div>

                <Separator />

                {/* Agent Panel Access */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="agent-panel-access" className="text-base font-semibold flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        Agent Panel Access
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow this member to use the AI agent panel for dashboard generation
                      </p>
                    </div>
                    <Switch
                      id="agent-panel-access"
                      checked={editAgentPanelAccess}
                      onCheckedChange={setEditAgentPanelAccess}
                      disabled={loading}
                    />
                  </div>

                  {editAgentPanelAccess && (
                    <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Allowed Models
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Select which AI models this member can use
                      </p>
                      <div className="space-y-2">
                        {availableModels.map((model) => {
                          const isSelected = editAllowedModels.includes(model.id);
                          return (
                            <div
                              key={model.id}
                              onClick={() => toggleModelPermission(model.id)}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "h-5 w-5 rounded border-2 flex items-center justify-center",
                                    isSelected
                                      ? "border-primary bg-primary"
                                      : "border-muted-foreground/30"
                                  )}
                                >
                                  {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{model.name}</p>
                                  <p className="text-xs text-muted-foreground">{model.provider}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {editAllowedModels.length === 0 && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          No models selected. Member won't be able to use the agent panel.
                        </p>
                      )}
                    </div>
                  )}
                </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/workspace/team")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !editName.trim() || !editEmail.trim() || (editAgentPanelAccess && editAllowedModels.length === 0)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
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
    </div>
  );
}

