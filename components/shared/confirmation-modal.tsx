"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export type ConfirmationAction =
  | "delete"
  | "update"
  | "remove"
  | "archive"
  | "custom";

export interface ConfirmationModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when the modal should close
   */
  onOpenChange: (open: boolean) => void;
  /**
   * The type of action being confirmed
   */
  action: ConfirmationAction;
  /**
   * The title of the confirmation dialog
   * If not provided, a default title based on action will be used
   */
  title?: string;
  /**
   * The description/message of the confirmation dialog
   * If not provided, a default message based on action will be used
   */
  description?: string;
  /**
   * The name of the item being acted upon (e.g., "Organization", "Data Source")
   * Used in default messages
   */
  itemName?: string;
  /**
   * The specific name/value of the item (e.g., "My Organization", "PostgreSQL DB")
   * Used in default messages
   */
  itemValue?: string;
  /**
   * Whether the action is in progress (shows loading state)
   */
  isLoading?: boolean;
  /**
   * Callback when the user confirms the action
   */
  onConfirm: () => void | Promise<void>;
  /**
   * Custom label for the confirm button
   */
  confirmLabel?: string;
  /**
   * Custom label for the cancel button
   */
  cancelLabel?: string;
  /**
   * Variant for the confirm button (default: "destructive" for delete, "default" for others)
   */
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  /**
   * Whether to show the cancel button (default: true)
   */
  showCancel?: boolean;
}

/**
 * Shared Confirmation Modal Component
 *
 * A reusable confirmation dialog for delete, update, and other destructive actions.
 * Provides consistent UI and messaging across the application.
 *
 * @example
 * ```tsx
 * const [showConfirm, setShowConfirm] = useState(false);
 *
 * <ConfirmationModal
 *   open={showConfirm}
 *   onOpenChange={setShowConfirm}
 *   action="delete"
 *   itemName="Organization"
 *   itemValue="My Org"
 *   onConfirm={async () => {
 *     await deleteOrganization(id);
 *     setShowConfirm(false);
 *   }}
 * />
 * ```
 */
export function ConfirmationModal({
  open,
  onOpenChange,
  action,
  title,
  description,
  itemName = "item",
  itemValue,
  isLoading = false,
  onConfirm,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmVariant,
  showCancel = true,
}: ConfirmationModalProps) {
  // Default titles based on action
  const defaultTitles: Record<ConfirmationAction, string> = {
    delete: `Delete ${itemName}`,
    update: `Update ${itemName}`,
    remove: `Remove ${itemName}`,
    archive: `Archive ${itemName}`,
    custom: "Confirm Action",
  };

  // Default descriptions based on action
  const defaultDescriptions: Record<ConfirmationAction, string> = {
    delete: itemValue
      ? `Are you sure you want to delete "${itemValue}"? This action cannot be undone.`
      : `Are you sure you want to delete this ${itemName.toLowerCase()}? This action cannot be undone.`,
    update: itemValue
      ? `Are you sure you want to update "${itemValue}"?`
      : `Are you sure you want to update this ${itemName.toLowerCase()}?`,
    remove: itemValue
      ? `Are you sure you want to remove "${itemValue}"?`
      : `Are you sure you want to remove this ${itemName.toLowerCase()}?`,
    archive: itemValue
      ? `Are you sure you want to archive "${itemValue}"?`
      : `Are you sure you want to archive this ${itemName.toLowerCase()}?`,
    custom: "Are you sure you want to proceed with this action?",
  };

  // Default confirm button labels
  const defaultConfirmLabels: Record<ConfirmationAction, string> = {
    delete: "Delete",
    update: "Update",
    remove: "Remove",
    archive: "Archive",
    custom: "Confirm",
  };

  // Default button variants (destructive for delete/remove, default for others)
  const defaultVariants: Record<ConfirmationAction, "default" | "destructive"> =
    {
      delete: "destructive",
      update: "default",
      remove: "destructive",
      archive: "default",
      custom: "default",
    };

  const finalTitle = title ?? defaultTitles[action];
  const finalDescription = description ?? defaultDescriptions[action];
  const finalConfirmLabel = confirmLabel ?? defaultConfirmLabels[action];
  const finalVariant = confirmVariant ?? defaultVariants[action];

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      // Error handling is done by the caller via toast
      console.error("Confirmation action failed:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{finalTitle}</AlertDialogTitle>
          <AlertDialogDescription>{finalDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showCancel && (
            <AlertDialogCancel disabled={isLoading}>
              {cancelLabel}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              finalVariant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {finalConfirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
