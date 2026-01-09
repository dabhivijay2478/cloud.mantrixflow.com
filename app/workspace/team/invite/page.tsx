"use client";

import { ArrowLeft, Check, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { PageHeader } from "@/components/shared";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
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
import { roleConfig, type TeamMemberRole } from "@/lib/constants/roles";

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
      showSuccessToast("created", "Invitation");
      // Reset form and redirect after a short delay
      setTimeout(() => {
        setEmail("");
        setSelectedRole("member");
        router.push("/workspace/team");
      }, 1500);
    } else if (state && !state.success) {
      showErrorToast(
        "createFailed",
        "Invitation",
        state.error || "Failed to send invitation",
      );
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
            className="-ml-2 hover:bg-accent"
            asChild
          >
            <Link href="/workspace/team">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Team
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
            <CardDescription>
              Enter the email address and role for the new team member
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="invite-role" className="text-sm font-medium">
                Role
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setSelectedRole(value as TeamMemberRole)
                }
                disabled={isPending}
                name="role"
              >
                <SelectTrigger id="invite-role" className="w-full">
                  <SelectValue>
                    {selectedRole
                      ? `${roleConfig[selectedRole].label} - ${roleConfig[selectedRole].description}`
                      : "Select a role"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleConfig)
                    .filter(([key]) => key !== "owner") // Remove owner from invite options
                    .map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label} - {config.description}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Note: Owner role cannot be assigned through invitations.
                Ownership must be transferred separately in organization
                settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
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
                  className="w-full sm:w-auto"
                  aria-busy={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Invitation...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
