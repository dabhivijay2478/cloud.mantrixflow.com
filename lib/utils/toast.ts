/**
 * Common toast utility functions for consistent toast usage across the application
 * This provides a centralized way to show toasts with consistent messaging
 */

import { toast as sonnerToast } from "sonner";

export const toast = {
  /**
   * Show a success toast
   */
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show an error toast
   */
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Show an info toast
   */
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show a warning toast
   */
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show a loading toast
   */
  loading: (message: string, description?: string) => {
    return sonnerToast.loading(message, {
      description,
    });
  },

  /**
   * Show a promise toast (loading -> success/error)
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  /**
   * Dismiss a toast by ID
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};

/**
 * Common toast messages for consistent messaging across the application
 * Use these for common operations to ensure consistent user experience
 */
export const toastMessages = {
  // Success messages
  success: {
    created: (itemName: string) => ({
      message: `${itemName} created successfully`,
      description: `Your ${itemName.toLowerCase()} has been created.`,
    }),
    updated: (itemName: string) => ({
      message: `${itemName} updated successfully`,
      description: `Your ${itemName.toLowerCase()} has been updated.`,
    }),
    deleted: (itemName: string) => ({
      message: `${itemName} deleted successfully`,
      description: `Your ${itemName.toLowerCase()} has been deleted.`,
    }),
    removed: (itemName: string) => ({
      message: `${itemName} removed successfully`,
      description: `Your ${itemName.toLowerCase()} has been removed.`,
    }),
    archived: (itemName: string) => ({
      message: `${itemName} archived successfully`,
      description: `Your ${itemName.toLowerCase()} has been archived.`,
    }),
    saved: (itemName: string) => ({
      message: `${itemName} saved successfully`,
      description: `Your ${itemName.toLowerCase()} has been saved.`,
    }),
    connected: (itemName: string) => ({
      message: `Connected to ${itemName}`,
      description: `Successfully connected to your ${itemName.toLowerCase()}.`,
    }),
    disconnected: (itemName: string) => ({
      message: `Disconnected from ${itemName}`,
      description: `Successfully disconnected from your ${itemName.toLowerCase()}.`,
    }),
    switched: (itemName: string) => ({
      message: `${itemName} switched successfully`,
      description: `You are now using the selected ${itemName.toLowerCase()}.`,
    }),
    invited: (itemName: string) => ({
      message: `${itemName} invited successfully`,
      description: `An invitation has been sent.`,
    }),
    accepted: (itemName: string) => ({
      message: `${itemName} accepted successfully`,
      description: `Your ${itemName.toLowerCase()} has been accepted.`,
    }),
    rejected: (itemName: string) => ({
      message: `${itemName} rejected successfully`,
      description: `Your ${itemName.toLowerCase()} has been rejected.`,
    }),
    copied: (itemName: string = "Content") => ({
      message: `${itemName} copied to clipboard`,
      description: `Your ${itemName.toLowerCase()} has been copied.`,
    }),
    exported: (itemName: string) => ({
      message: `${itemName} exported successfully`,
      description: `Your ${itemName.toLowerCase()} has been exported.`,
    }),
    imported: (itemName: string) => ({
      message: `${itemName} imported successfully`,
      description: `Your ${itemName.toLowerCase()} has been imported.`,
    }),
  },

  // Error messages
  error: {
    createFailed: (itemName: string, error?: string) => ({
      message: `Failed to create ${itemName.toLowerCase()}`,
      description:
        error ||
        `Unable to create ${itemName.toLowerCase()}. Please try again.`,
    }),
    updateFailed: (itemName: string, error?: string) => ({
      message: `Failed to update ${itemName.toLowerCase()}`,
      description:
        error ||
        `Unable to update ${itemName.toLowerCase()}. Please try again.`,
    }),
    deleteFailed: (itemName: string, error?: string) => ({
      message: `Failed to delete ${itemName.toLowerCase()}`,
      description:
        error ||
        `Unable to delete ${itemName.toLowerCase()}. Please try again.`,
    }),
    removeFailed: (itemName: string, error?: string) => ({
      message: `Failed to remove ${itemName.toLowerCase()}`,
      description:
        error ||
        `Unable to remove ${itemName.toLowerCase()}. Please try again.`,
    }),
    archiveFailed: (itemName: string, error?: string) => ({
      message: `Failed to archive ${itemName.toLowerCase()}`,
      description:
        error ||
        `Unable to archive ${itemName.toLowerCase()}. Please try again.`,
    }),
    saveFailed: (itemName: string, error?: string) => ({
      message: `Failed to save ${itemName.toLowerCase()}`,
      description:
        error || `Unable to save ${itemName.toLowerCase()}. Please try again.`,
    }),
    connectFailed: (itemName: string, error?: string) => ({
      message: `Failed to connect to ${itemName.toLowerCase()}`,
      description:
        error ||
        `Unable to connect to ${itemName.toLowerCase()}. Please check your settings and try again.`,
    }),
    disconnectFailed: (itemName: string, error?: string) => ({
      message: `Failed to disconnect from ${itemName.toLowerCase()}`,
      description:
        error ||
        `Unable to disconnect from ${itemName.toLowerCase()}. Please try again.`,
    }),
    switchFailed: (itemName: string, error?: string) => ({
      message: `Failed to switch ${itemName.toLowerCase()}`,
      description:
        error ||
        `Unable to switch ${itemName.toLowerCase()}. Please try again.`,
    }),
    inviteFailed: (itemName: string, error?: string) => ({
      message: `Failed to invite ${itemName.toLowerCase()}`,
      description: error || `Unable to send invitation. Please try again.`,
    }),
    acceptFailed: (itemName: string, error?: string) => ({
      message: `Failed to accept ${itemName.toLowerCase()}`,
      description:
        error ||
        `Unable to accept ${itemName.toLowerCase()}. Please try again.`,
    }),
    rejectFailed: (itemName: string, error?: string) => ({
      message: `Failed to reject ${itemName.toLowerCase()}`,
      description:
        error ||
        `Unable to reject ${itemName.toLowerCase()}. Please try again.`,
    }),
    loadFailed: (itemName: string, error?: string) => ({
      message: `Failed to load ${itemName.toLowerCase()}`,
      description:
        error ||
        `Unable to load ${itemName.toLowerCase()}. Please refresh and try again.`,
    }),
    notFound: (itemName: string) => ({
      message: `${itemName} not found`,
      description: `The requested ${itemName.toLowerCase()} could not be found.`,
    }),
    unauthorized: (action?: string) => ({
      message: "Unauthorized",
      description: action
        ? `You don't have permission to ${action}.`
        : "You don't have permission to perform this action.",
    }),
    validationFailed: (error?: string) => ({
      message: "Validation failed",
      description: error || "Please check your input and try again.",
    }),
    networkError: () => ({
      message: "Network error",
      description:
        "Unable to connect to the server. Please check your internet connection.",
    }),
    serverError: (error?: string) => ({
      message: "Server error",
      description:
        error || "An error occurred on the server. Please try again later.",
    }),
    unknownError: (error?: string) => ({
      message: "An error occurred",
      description: error || "Something went wrong. Please try again.",
    }),
  },

  // Info messages
  info: {
    processing: (itemName: string) => ({
      message: `Processing ${itemName.toLowerCase()}`,
      description: `Please wait while we process your ${itemName.toLowerCase()}.`,
    }),
    loading: (itemName: string) => ({
      message: `Loading ${itemName.toLowerCase()}`,
      description: `Please wait while we load your ${itemName.toLowerCase()}.`,
    }),
  },

  // Warning messages
  warning: {
    unsavedChanges: () => ({
      message: "Unsaved changes",
      description: "You have unsaved changes. Are you sure you want to leave?",
    }),
    actionRequired: (action: string) => ({
      message: "Action required",
      description: `Please ${action} to continue.`,
    }),
  },
};

/**
 * Helper function to show success toast with common message
 */
export function showSuccessToast(
  action:
    | "created"
    | "updated"
    | "deleted"
    | "removed"
    | "archived"
    | "saved"
    | "connected"
    | "disconnected"
    | "switched"
    | "invited"
    | "accepted"
    | "rejected"
    | "copied"
    | "exported"
    | "imported",
  itemName: string,
) {
  const message = toastMessages.success[action](itemName);
  return toast.success(message.message, message.description);
}

/**
 * Helper function to show error toast with common message
 */
export function showErrorToast(
  action:
    | "createFailed"
    | "updateFailed"
    | "deleteFailed"
    | "removeFailed"
    | "archiveFailed"
    | "saveFailed"
    | "connectFailed"
    | "disconnectFailed"
    | "switchFailed"
    | "inviteFailed"
    | "acceptFailed"
    | "rejectFailed"
    | "loadFailed"
    | "notFound"
    | "unauthorized"
    | "validationFailed"
    | "networkError"
    | "serverError"
    | "unknownError",
  itemName?: string,
  error?: string,
) {
  if (itemName) {
    const message = toastMessages.error[action](itemName, error);
    return toast.error(message.message, message.description);
  } else {
    // For actions that don't require itemName
    // Handle different function signatures based on action type
    let message: { message: string; description: string };
    if (action === "networkError") {
      message = toastMessages.error.networkError();
    } else if (action === "unauthorized") {
      message = toastMessages.error.unauthorized(error);
    } else {
      // validationFailed, serverError, unknownError all accept optional error
      const errorHandler = toastMessages.error[action] as (error?: string) => {
        message: string;
        description: string;
      };
      message = errorHandler(error);
    }
    return toast.error(message.message, message.description);
  }
}
