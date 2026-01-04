"use client";

import {
  ArrowLeft,
  Check,
  Loader2,
  Mail,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { PageHeader } from "@/components/shared";
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
import {
  inviteTeamMemberAction,
  type TeamActionResult,
} from "@/lib/actions/team";
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

export default function InviteTeamMemberPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole>("member");

  const [state, formAction, isPending] = useActionState<
    TeamActionResult | null,
    FormData
  >(inviteTeamMemberAction, null);

  // Handle form state changes
  useEffect(() => {
    if (state?.success) {
      toast.success("Invitation sent!", {
        description: state.message || `Invitation sent to ${email}`,
      });
      // Reset form and redirect after a short delay
      setTimeout(() => {
        setEmail("");
        setSelectedRole("member");
        router.push("/workspace/team");
      }, 1500);
    } else if (state && !state.success) {
      toast.error("Failed to send invitation", { description: state.error });
    }
  }, [state, email, router]);


  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-4xl">
      <PageHeader
        title="Invite Team Member"
        description="Send an invitation to add a new team member to your organization"
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
                name="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 text-base"
                required
                disabled={isPending}
                aria-invalid={
                  state && !state.success && state.fieldErrors?.email
                    ? "true"
                    : "false"
                }
              />
              {state && !state.success && state.fieldErrors?.email && (
                <p className="text-sm text-destructive mt-1">
                  {state.fieldErrors.email[0]}
                </p>
              )}
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
                disabled={isPending}
                name="role"
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
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="border-2 bg-muted/30">
          <CardContent className="pt-6">
            <form action={formAction} noValidate>
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="role" value={selectedRole} />
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/workspace/team")}
                  disabled={isPending}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !email.trim()}
                  className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow"
                  size="lg"
                  aria-busy={isPending}
                >
                  {isPending ? (
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
            </form>
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
