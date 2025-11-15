"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * FormActions
 * @description Standardized form footer with submit and optional cancel buttons.
 * Provides consistent form action layout across the application.
 * @param {FormActionsProps} props - Component properties
 * @param {string} [props.submitLabel] - Submit button label (default: "Submit")
 * @param {string} [props.cancelLabel] - Cancel button label (default: "Cancel")
 * @param {() => void} [props.onCancel] - Cancel button click handler
 * @param {boolean} [props.loading] - Loading state (disables submit button)
 * @param {boolean} [props.disabled] - Disable submit button
 * @param {"default" | "reverse"} [props.layout] - Button layout (default: "default")
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} FormActions component
 * @example
 * <FormActions
 *   submitLabel="Save Changes"
 *   cancelLabel="Discard"
 *   onCancel={() => router.back()}
 *   loading={isSubmitting}
 * />
 */
export interface FormActionsProps {
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  layout?: "default" | "reverse";
  className?: string;
}

export function FormActions({
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onCancel,
  loading = false,
  disabled = false,
  layout = "default",
  className,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        layout === "reverse" && "flex-row-reverse",
        className,
      )}
    >
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading || disabled}
        >
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" disabled={loading || disabled}>
        {loading ? "Loading..." : submitLabel}
      </Button>
    </div>
  );
}
