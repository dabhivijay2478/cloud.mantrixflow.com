"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

/**
 * OAuthButtons
 * @description Standardized OAuth provider buttons (GitHub, Google).
 * @param {OAuthButtonsProps} props - Component properties
 * @param {() => void | Promise<void>} [props.onGitHubClick] - GitHub button click handler
 * @param {() => void | Promise<void>} [props.onGoogleClick] - Google button click handler
 * @param {boolean} [props.disabled] - Disable all buttons
 * @param {"default" | "compact"} [props.variant] - Button layout variant (default: "default")
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} OAuthButtons component
 * @example
 * <OAuthButtons
 *   onGitHubClick={handleGitHubLogin}
 *   onGoogleClick={handleGoogleLogin}
 *   disabled={isSubmitting}
 * />
 */
export interface OAuthButtonsProps {
  onGitHubClick?: () => void | Promise<void>;
  onGoogleClick?: () => void | Promise<void>;
  disabled?: boolean;
  variant?: "default" | "compact";
  className?: string;
}

export function OAuthButtons({
  onGitHubClick,
  onGoogleClick,
  disabled = false,
  variant = "default",
  className,
}: OAuthButtonsProps) {
  if (variant === "compact") {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className || ""}`}>
        {onGitHubClick && (
          <Button
            variant="outline"
            type="button"
            className="h-8 text-xs"
            onClick={onGitHubClick}
            disabled={disabled}
          >
            <FaGithub className="size-3" />
            GitHub
          </Button>
        )}
        {onGoogleClick && (
          <Button
            variant="outline"
            type="button"
            className="h-8 text-xs"
            onClick={onGoogleClick}
            disabled={disabled}
          >
            <FcGoogle className="size-3" />
            Google
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className || ""}`}>
      {onGitHubClick && (
        <Button
          variant="outline"
          type="button"
          onClick={onGitHubClick}
          disabled={disabled}
          className="w-full"
        >
          <FaGithub className="size-4" />
          Login with GitHub
        </Button>
      )}
      {onGoogleClick && (
        <Button
          variant="outline"
          type="button"
          onClick={onGoogleClick}
          disabled={disabled}
          className="w-full"
        >
          <FcGoogle className="size-4" />
          Login with Google
        </Button>
      )}
    </div>
  );
}
