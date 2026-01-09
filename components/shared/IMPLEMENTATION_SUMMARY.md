# Shared Confirmation Modal & Toast Messages - Implementation Summary

## Overview

This implementation provides reusable components and utilities for consistent user feedback across the application:

1. **ConfirmationModal** - A shared confirmation dialog for delete/update operations
2. **Enhanced Toast Messages** - Common success/error messages for consistent UX
3. **useConfirmation Hook** - Easy-to-use hook for managing confirmation modals

## Files Created

### Components
- `apps/app/components/shared/confirmation-modal.tsx` - Main confirmation modal component
- `apps/app/components/shared/index.ts` - Export file for shared components

### Hooks
- `apps/app/hooks/use-confirmation.ts` - Hook for managing confirmation state

### Utilities
- `apps/app/lib/utils/toast.ts` - Enhanced with common toast messages

### Documentation
- `apps/app/components/shared/README.md` - Component documentation
- `apps/app/components/shared/USAGE_EXAMPLES.md` - Usage examples
- `apps/app/components/shared/IMPLEMENTATION_SUMMARY.md` - This file

## Files Updated

### Pages Updated to Use New Components
- `apps/app/app/organizations/page.tsx` - Updated to use new toast utilities
- `apps/app/components/workspace/workspace-sidebar.tsx` - Updated to use new toast utilities

## Features

### ConfirmationModal Component

**Features:**
- Supports multiple action types: `delete`, `update`, `remove`, `archive`, `custom`
- Automatic default titles and descriptions based on action type
- Loading state support
- Customizable labels and variants
- Consistent UI across all confirmations

**Usage:**
```tsx
<ConfirmationModal
  open={showConfirm}
  onOpenChange={setShowConfirm}
  action="delete"
  itemName="Organization"
  itemValue="My Org"
  onConfirm={handleDelete}
  isLoading={isDeleting}
/>
```

### useConfirmation Hook

**Features:**
- Simplified state management
- Automatic loading state handling
- Easy integration with async operations

**Usage:**
```tsx
const { showConfirm, confirmProps } = useConfirmation({
  action: "delete",
  itemName: "Organization",
  onConfirm: async () => {
    await deleteOrg(id);
    showSuccessToast("deleted", "Organization");
  },
});

<Button onClick={() => showConfirm("My Org")}>Delete</Button>
<ConfirmationModal {...confirmProps} />
```

### Toast Messages

**Features:**
- Pre-defined success messages for common actions
- Pre-defined error messages with consistent formatting
- Helper functions for easy usage
- Type-safe message selection

**Available Success Actions:**
- `created`, `updated`, `deleted`, `removed`, `archived`, `saved`
- `connected`, `disconnected`, `switched`
- `invited`, `accepted`, `rejected`
- `copied`, `exported`, `imported`

**Available Error Actions:**
- `createFailed`, `updateFailed`, `deleteFailed`, `removeFailed`, `archiveFailed`, `saveFailed`
- `connectFailed`, `disconnectFailed`, `switchFailed`
- `inviteFailed`, `acceptFailed`, `rejectFailed`, `loadFailed`
- `notFound`, `unauthorized`, `validationFailed`
- `networkError`, `serverError`, `unknownError`

**Usage:**
```tsx
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";

showSuccessToast("created", "Organization");
showErrorToast("createFailed", "Organization", errorMessage);
```

## Migration Guide

### Replacing Existing Toast Calls

**Before:**
```tsx
import { toast } from "sonner";

toast.success("Organization created successfully");
toast.error("Failed to create organization", { description: "..." });
```

**After:**
```tsx
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";

showSuccessToast("created", "Organization");
showErrorToast("createFailed", "Organization", errorMessage);
```

### Adding Confirmation Modals

**Before:**
```tsx
// No confirmation, direct delete
const handleDelete = async () => {
  await deleteItem(id);
  toast.success("Deleted");
};
```

**After:**
```tsx
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { useConfirmation } from "@/hooks/use-confirmation";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";

const { showConfirm, confirmProps } = useConfirmation({
  action: "delete",
  itemName: "Item",
  onConfirm: async () => {
    try {
      await deleteItem(id);
      showSuccessToast("deleted", "Item");
    } catch (error) {
      showErrorToast("deleteFailed", "Item");
      throw error;
    }
  },
});

<Button onClick={() => showConfirm(itemName)}>Delete</Button>
<ConfirmationModal {...confirmProps} />
```

## Benefits

1. **Consistency** - All confirmations and toasts use the same UI and messaging
2. **Maintainability** - Update messages in one place, affects entire app
3. **Type Safety** - TypeScript ensures correct usage
4. **Developer Experience** - Simple API, less boilerplate
5. **User Experience** - Consistent feedback across all operations

## Next Steps

To fully adopt these components across the application:

1. **Replace all toast calls** with the new helper functions
2. **Add confirmation modals** to all delete/update operations
3. **Update existing confirmation dialogs** to use the shared component
4. **Test thoroughly** to ensure consistent behavior

## Examples

See `USAGE_EXAMPLES.md` for comprehensive examples of:
- Basic confirmation modal usage
- Using the hook
- Different action types
- Error handling patterns
- Complete CRUD examples
