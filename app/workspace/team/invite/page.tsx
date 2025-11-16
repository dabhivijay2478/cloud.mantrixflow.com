"use client";

import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Check,
  Loader2,
  Mail,
  Shield,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
    icon: Shield,
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
    icon: Shield,
    color: "text-green-600",
    bgColor: "bg-green-500",
    description: "Create and edit dashboards and data sources",
    permissions: ["Create dashboards", "Edit content", "Connect data sources"],
  },
  viewer: {
    label: "Viewer",
    icon: Shield,
    color: "text-gray-600",
    bgColor: "bg-gray-500",
    description: "View-only access to dashboards",
    permissions: ["View dashboards", "Export data", "Basic reporting"],
  },
  guest: {
    label: "Guest",
    icon: Shield,
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

export default function InviteTeamMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole>("member");
  const [agentPanelAccess, setAgentPanelAccess] = useState(false);
  const [allowedModels, setAllowedModels] = useState<string[]>([]);

  const toggleModelPermission = (modelId: string) => {
    if (allowedModels.includes(modelId)) {
      setAllowedModels(allowedModels.filter((id) => id !== modelId));
    } else {
      setAllowedModels([...allowedModels, modelId]);
    }
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (agentPanelAccess && allowedModels.length === 0) {
      toast.error(
        "Please select at least one model if agent panel access is enabled",
      );
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Invitation sent to ${email}`);
      router.push("/workspace/team");
    } catch {
      toast.error("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleConfig = roleConfig[selectedRole];
  const Icon = selectedRoleConfig.icon;

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-4xl">
      {/* Header with Back Button */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/workspace/team")}
          className="mb-4 -ml-2 hover:bg-accent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Team
        </Button>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Invite Team Member
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Send an invitation to add a new team member to your organization
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Member Information
            </CardTitle>
            <CardDescription>
              Enter the email address and role for the new team member
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Input */}
            <div className="space-y-3">
              <Label
                htmlFor="invite-email"
                className="text-sm font-medium flex items-center gap-2"
              >
                Email Address
                <span className="text-destructive text-xs">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 text-base"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                An invitation email will be sent to this address
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label
                htmlFor="invite-role"
                className="text-sm font-medium flex items-center gap-2"
              >
                Role
                <span className="text-destructive text-xs">*</span>
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setSelectedRole(value as TeamMemberRole)
                }
                disabled={loading}
              >
                <SelectTrigger id="invite-role" className="h-12 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[400px]">
                    {Object.entries(roleConfig).map(([key, config]) => {
                      const RoleIcon = config.icon;
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
                              <RoleIcon className="h-5 w-5" />
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
                    <Icon className="h-5 w-5" />
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
                checked={agentPanelAccess}
                onCheckedChange={setAgentPanelAccess}
                disabled={loading}
              />
            </div>
          </CardHeader>

          {agentPanelAccess && (
            <CardContent className="space-y-4 pt-0">
              <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-primary">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">Select AI Models</p>
                    <p className="text-xs text-muted-foreground">
                      Choose which AI models this member can use for generating
                      dashboards and insights
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {availableModels.map((model) => {
                  const isSelected = allowedModels.includes(model.id);
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

              {allowedModels.length === 0 && (
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

              {allowedModels.length > 0 && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                        {allowedModels.length} model
                        {allowedModels.length !== 1 ? "s" : ""} selected
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
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/workspace/team")}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={
                  loading ||
                  !email.trim() ||
                  (agentPanelAccess && allowedModels.length === 0)
                }
                className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <p className="text-xs text-muted-foreground text-center">
            The invited member will receive an email with instructions to join
            your organization. They can accept the invitation within 7 days.
          </p>
        </div>
      </div>
    </div>
  );
}
