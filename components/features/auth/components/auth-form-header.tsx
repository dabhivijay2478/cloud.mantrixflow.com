"use client";

import * as React from "react";

/**
 * AuthFormHeader
 * @description Standardized header for auth forms with title and description.
 * @param {AuthFormHeaderProps} props - Component properties
 * @param {string} props.title - Form title
 * @param {string} [props.description] - Form description
 * @returns {JSX.Element} AuthFormHeader component
 * @example
 * <AuthFormHeader
 *   title="Login to your account"
 *   description="Enter your email below to login to your account"
 * />
 */
export interface AuthFormHeaderProps {
  title: string;
  description?: string;
}

export function AuthFormHeader({ title, description }: AuthFormHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && (
        <p className="text-muted-foreground text-sm text-balance">
          {description}
        </p>
      )}
    </div>
  );
}
