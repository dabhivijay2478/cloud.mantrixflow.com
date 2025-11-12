"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * RegenerateButton
 * @description Retry prompt for new AI-generated insights.
 * Allows users to regenerate dashboard or insights with same or modified prompt.
 * @param {RegenerateButtonProps} props - Component properties
 * @param {() => void | Promise<void>} props.onRegenerate - Regenerate handler
 * @param {boolean} [props.loading] - Loading state
 * @param {boolean} [props.disabled] - Disabled state
 * @param {boolean} [props.showLabel] - Show "Regenerate" label (default: true)
 * @param {RegenerateButtonVariant} [props.variant] - Button variant
 * @param {RegenerateButtonSize} [props.size] - Button size
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} RegenerateButton component
 * @example
 * <RegenerateButton
 *   onRegenerate={async () => {
 *     await regenerateDashboard();
 *   }}
 * />
 */

export type RegenerateButtonVariant = "default" | "outline" | "ghost" | "secondary";
export type RegenerateButtonSize = "sm" | "default" | "lg";

export interface RegenerateButtonProps {
  onRegenerate: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  showLabel?: boolean;
  variant?: RegenerateButtonVariant;
  size?: RegenerateButtonSize;
  className?: string;
}

export function RegenerateButton({
  onRegenerate,
  loading = false,
  disabled = false,
  showLabel = true,
  variant = "outline",
  size = "default",
  className,
}: RegenerateButtonProps) {
  const handleClick = async () => {
    try {
      await onRegenerate();
    } catch (error) {
      console.error("Regenerate failed:", error);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={cn(className)}
      aria-label="Regenerate"
    >
      <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
      {showLabel && (
        <span className="ml-2">
          {loading ? "Regenerating..." : "Regenerate"}
        </span>
      )}
    </Button>
  );
}
