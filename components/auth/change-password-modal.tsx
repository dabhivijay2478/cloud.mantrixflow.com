"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import {
  type AuthActionResult,
  changePasswordAction,
} from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/utils/toast";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
}: ChangePasswordModalProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(changePasswordAction, null);

  // Handle form state changes
  useEffect(() => {
    if (state?.success) {
      toast.success("Password changed!", state.message);
      // Close modal
      onOpenChange(false);
      // Logout user
      const logout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        // Redirect to login
        router.push("/auth/login");
      };
      logout();
    } else if (state && !state.success) {
      toast.error("Password change failed", state.error);
    }
  }, [state, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form action={formAction} noValidate>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one. You will be
              logged out after changing your password.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-4 py-4">
            <Field>
              <FieldLabel htmlFor="oldPassword">Current Password</FieldLabel>
              <PasswordInput
                id="oldPassword"
                name="oldPassword"
                autoComplete="current-password"
                placeholder="Enter your current password"
                required
                aria-invalid={
                  state && !state.success && state.fieldErrors?.oldPassword
                    ? "true"
                    : "false"
                }
                aria-describedby={
                  state && !state.success && state.fieldErrors?.oldPassword
                    ? "oldPassword-error"
                    : undefined
                }
                disabled={isPending}
              />
              {state && !state.success && state.fieldErrors?.oldPassword && (
                <FieldError
                  id="oldPassword-error"
                  errors={state.fieldErrors.oldPassword}
                />
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                placeholder="Enter your new password"
                required
                aria-invalid={
                  state && !state.success && state.fieldErrors?.password
                    ? "true"
                    : "false"
                }
                aria-describedby={
                  state && !state.success && state.fieldErrors?.password
                    ? "password-error"
                    : undefined
                }
                disabled={isPending}
              />
              {state && !state.success && state.fieldErrors?.password && (
                <FieldError
                  id="password-error"
                  errors={state.fieldErrors.password}
                />
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Must contain at least one uppercase letter, one lowercase
                letter, and one number
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm New Password
              </FieldLabel>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm your new password"
                required
                aria-invalid={
                  state && !state.success && state.fieldErrors?.confirmPassword
                    ? "true"
                    : "false"
                }
                aria-describedby={
                  state && !state.success && state.fieldErrors?.confirmPassword
                    ? "confirmPassword-error"
                    : undefined
                }
                disabled={isPending}
              />
              {state &&
                !state.success &&
                state.fieldErrors?.confirmPassword && (
                  <FieldError
                    id="confirmPassword-error"
                    errors={state.fieldErrors.confirmPassword}
                  />
                )}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
