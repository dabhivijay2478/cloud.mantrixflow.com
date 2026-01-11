"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roleConfig, type TeamMemberRole } from "@/lib/constants/roles";

export interface RoleSelectProps {
  /**
   * The currently selected role value
   */
  value: TeamMemberRole;
  /**
   * Callback when the role selection changes
   */
  onValueChange: (value: TeamMemberRole) => void;
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  /**
   * The id for the select trigger (for accessibility)
   */
  id?: string;
  /**
   * The name attribute for form submission
   */
  name?: string;
  /**
   * Custom label text (defaults to "Role")
   */
  label?: string;
  /**
   * Custom help text to display below the select
   */
  helpText?: string;
  /**
   * Whether to show the default help text about owner role
   * (defaults to true if helpText is not provided)
   */
  showDefaultHelpText?: boolean;
  /**
   * Additional className for the container
   */
  className?: string;
}

/**
 * Reusable role selection component for team member invites and edits.
 * Automatically filters out the OWNER role from available options.
 */
export function RoleSelect({
  value,
  onValueChange,
  disabled = false,
  id = "role-select",
  name,
  label = "Role",
  helpText,
  showDefaultHelpText = true,
  className,
}: RoleSelectProps) {
  const defaultHelpText =
    "Note: Owner role cannot be assigned through invitations. Ownership must be transferred separately in organization settings.";

  return (
    <div className={className}>
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <Select
          value={value}
          onValueChange={(value) => onValueChange(value as TeamMemberRole)}
          disabled={disabled}
          name={name}
        >
          <SelectTrigger id={id} className="w-full cursor-pointer">
            <SelectValue>
              {value
                ? `${roleConfig[value].label} - ${roleConfig[value].description}`
                : "Select a role"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(roleConfig)
              .filter(([key]) => key !== "OWNER") // Remove OWNER from options
              .map(([key, config]) => (
                <SelectItem key={key} value={key} className="cursor-pointer">
                  {config.label} - {config.description}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {(helpText || (showDefaultHelpText && !helpText)) && (
          <p className="text-xs text-muted-foreground">
            {helpText || defaultHelpText}
          </p>
        )}
      </div>
    </div>
  );
}
