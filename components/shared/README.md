# Shared Components

This directory contains reusable components and utilities used across the application.

## ConfirmationModal

A reusable confirmation dialog for delete, update, and other destructive actions.

### Usage

#### Basic Usage

```tsx
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { useState } from "react";

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    await deleteItem(id);
    setShowConfirm(false);
    toast.success("Item deleted successfully");
  };

  return (
    <>
      <Button onClick={() => setShowConfirm(true)}>Delete</Button>
      <ConfirmationModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        action="delete"
        itemName="Item"
        itemValue="My Item"
        onConfirm={handleDelete}
      />
    </>
  );
}
```

#### Using the Hook

```tsx
import { useConfirmation } from "@/hooks/use-confirmation";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";

function MyComponent() {
  const { showConfirm, confirmProps } = useConfirmation({
    action: "delete",
    itemName: "Organization",
    onConfirm: async () => {
      try {
        await deleteOrganization(id);
        showSuccessToast("deleted", "Organization");
      } catch (error) {
        showErrorToast("deleteFailed", "Organization", error.message);
      }
    },
  });

  return (
    <>
      <Button onClick={() => showConfirm("My Organization")}>Delete</Button>
      <ConfirmationModal {...confirmProps} />
    </>
  );
}
```

### Props

- `open`: Whether the modal is open
- `onOpenChange`: Callback when the modal should close
- `action`: Type of action ("delete" | "update" | "remove" | "archive" | "custom")
- `title`: Custom title (optional, defaults based on action)
- `description`: Custom description (optional, defaults based on action)
- `itemName`: Name of the item being acted upon (e.g., "Organization")
- `itemValue`: Specific value of the item (e.g., "My Org")
- `isLoading`: Whether the action is in progress
- `onConfirm`: Callback when user confirms
- `confirmLabel`: Custom confirm button label
- `cancelLabel`: Custom cancel button label
- `confirmVariant`: Button variant
- `showCancel`: Whether to show cancel button

## Toast Messages

Common toast messages for consistent user feedback.

### Usage

```tsx
import { toast, showSuccessToast, showErrorToast } from "@/lib/utils/toast";

// Using helper functions
showSuccessToast("created", "Organization");
showErrorToast("createFailed", "Organization", "Network error");

// Using toast directly with common messages
import { toastMessages } from "@/lib/utils/toast";
const message = toastMessages.success.created("Organization");
toast.success(message.message, message.description);
```

### Available Actions

**Success:**
- `created`, `updated`, `deleted`, `removed`, `archived`, `saved`
- `connected`, `disconnected`, `switched`
- `invited`, `accepted`, `rejected`
- `copied`, `exported`, `imported`

**Error:**
- `createFailed`, `updateFailed`, `deleteFailed`, `removeFailed`, `archiveFailed`, `saveFailed`
- `connectFailed`, `disconnectFailed`, `switchFailed`
- `inviteFailed`, `acceptFailed`, `rejectFailed`, `loadFailed`
- `notFound`, `unauthorized`, `validationFailed`
- `networkError`, `serverError`, `unknownError`
