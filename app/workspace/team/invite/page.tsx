"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, UserPlus, Mail, Loader2, Bot, Sparkles, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TeamMemberRole = "owner" | "admin" | "member" | "viewer" | "guest";

const roleConfig: Record<TeamMemberRole, { label: string; icon: typeof Bot; color: string; description: string }> = {
  owner: {
    label: "Owner",
    icon: Bot,
    color: "bg-purple-500",
    description: "Full access to all features and settings",
  },
  admin: {
    label: "Admin",
    icon: Bot,
    color: "bg-blue-500",
    description: "Manage team members and organization settings",
  },
  member: {
    label: "Member",
    icon: Bot,
    color: "bg-green-500",
    description: "Create and edit dashboards and data sources",
  },
  viewer: {
    label: "Viewer",
    icon: Bot,
    color: "bg-gray-500",
    description: "View-only access to dashboards",
  },
  guest: {
    label: "Guest",
    icon: Bot,
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
      toast.error("Please select at least one model if agent panel access is enabled");
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Invitation sent to ${email}`);
      router.push("/workspace/team");
    } catch (error) {
      toast.error("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/workspace/team")}
            className="mb-4 sm:mb-6 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Invite Team Member</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Send an invitation to add a new team member to your organization
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-2 shadow-lg">
              <CardHeader className="pb-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Member Details</CardTitle>
                    <CardDescription className="mt-1">
                      Enter the details for the new team member
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="invite-email" className="text-base font-semibold flex items-center gap-2">
                    Email Address
                    <span className="text-destructive">*</span>
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
                  <p className="text-xs text-muted-foreground">
                    An invitation email will be sent to this address
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-role" className="text-base font-semibold">
                    Role
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as TeamMemberRole)} disabled={loading}>
                    <SelectTrigger id="invite-role" className="h-11">
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
                      checked={agentPanelAccess}
                      onCheckedChange={setAgentPanelAccess}
                      disabled={loading}
                    />
                  </div>

                  {agentPanelAccess && (
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
                          const isSelected = allowedModels.includes(model.id);
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
                      {allowedModels.length === 0 && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          No models selected. Member won't be able to use the agent panel.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t">
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
                    disabled={loading || !email.trim() || (agentPanelAccess && allowedModels.length === 0)}
                    className="w-full sm:w-auto min-w-[160px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
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
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-6">
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 dark:text-blue-400 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Enter valid email</p>
                      <p className="text-xs text-muted-foreground">
                        Make sure the email address is correct and active
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-700 dark:text-green-400 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Choose appropriate role</p>
                      <p className="text-xs text-muted-foreground">
                        Select a role that matches the member's responsibilities
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-700 dark:text-purple-400 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Configure permissions</p>
                      <p className="text-xs text-muted-foreground">
                        Set agent panel access and model permissions as needed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

