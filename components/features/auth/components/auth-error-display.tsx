"use client";

import * as React from "react";
import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/**
 * AuthErrorDisplay
 * @description Standardized error display for auth forms.
 * @param {AuthErrorDisplayProps} props - Component properties
 * @param {string | null} props.error - Error message to display
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element | null} AuthErrorDisplay component or null if no error
 * @example
 * <AuthErrorDisplay error={authError} />
 */
export interface AuthErrorDisplayProps {
  error: string | null;
  className?: string;
}

export function AuthErrorDisplay({ error, className }: AuthErrorDisplayProps) {
  if (!error) return null;

  return (
    <FieldError
      className={cn(
        "bg-destructive/10 border-destructive/20 border rounded-md p-3 text-center",
        className,
      )}
    >
      {error}
    </FieldError>
  );
}
