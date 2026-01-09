"use client";

import { useState, useCallback } from "react";
import type { ConfirmationAction } from "@/components/shared/confirmation-modal";

export interface UseConfirmationOptions {
  /**
   * The type of action being confirmed
   */
  action: ConfirmationAction;
  /**
   * The name of the item being acted upon
   */
  itemName?: string;
  /**
   * Callback when the user confirms the action
   */
  onConfirm: () => void | Promise<void>;
  /**
   * Custom title for the confirmation dialog
   */
  title?: string;
  /**
   * Custom description for the confirmation dialog
   */
  description?: string;
  /**
   * Custom confirm button label
   */
  confirmLabel?: string;
  /**
   * Custom cancel button label
   */
  cancelLabel?: string;
  /**
   * Variant for the confirm button
   */
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /**
   * Whether to show the cancel button
   */
  showCancel?: boolean;
}

export interface ConfirmationState {
  /**
   * Whether the confirmation modal is open
   */
  isOpen: boolean;
  /**
   * The item value being acted upon
   */
  itemValue?: string;
  /**
   * Whether the action is in progress
   */
  isLoading: boolean;
}

/**
 * Hook for managing confirmation modals
 * 
 * Provides a simple way to show confirmation dialogs with consistent behavior.
 * 
 * @example
 * ```tsx
 * const { showConfirm, confirmProps } = useConfirmation({
 *   action: "delete",
 *   itemName: "Organization",
 *   onConfirm: async () => {
 *     await deleteOrganization(id);
 *     toast.success("Organization deleted successfully");
 *   },
 * });
 * 
 * // In JSX:
 * <Button onClick={() => showConfirm("My Org")}>Delete</Button>
 * <ConfirmationModal {...confirmProps} />
 * ```
 */
export function useConfirmation(options: UseConfirmationOptions) {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    itemValue: undefined,
    isLoading: false,
  });

  const showConfirm = useCallback(
    (itemValue?: string) => {
      setState({
        isOpen: true,
        itemValue,
        isLoading: false,
      });
    },
    []
  );

  const hideConfirm = useCallback(() => {
    if (!state.isLoading) {
      setState((prev) => ({
        ...prev,
        isOpen: false,
      }));
    }
  }, [state.isLoading]);

  const handleConfirm = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await options.onConfirm();
      setState({
        isOpen: false,
        itemValue: undefined,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [options.onConfirm]);

  const confirmProps = {
    open: state.isOpen,
    onOpenChange: hideConfirm,
    action: options.action,
    itemName: options.itemName,
    itemValue: state.itemValue,
    isLoading: state.isLoading,
    onConfirm: handleConfirm,
    title: options.title,
    description: options.description,
    confirmLabel: options.confirmLabel,
    cancelLabel: options.cancelLabel,
    confirmVariant: options.confirmVariant,
    showCancel: options.showCancel,
  };

  return {
    showConfirm,
    hideConfirm,
    confirmProps,
    isOpen: state.isOpen,
    isLoading: state.isLoading,
  };
}
