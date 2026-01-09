# Usage Examples

## Confirmation Modal Examples

### Example 1: Delete Operation

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { useDeleteOrganization } from "@/lib/api/hooks/use-organizations";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";

export function DeleteOrganizationButton({ orgId, orgName }: { orgId: string; orgName: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const deleteOrg = useDeleteOrganization();

  const handleDelete = async () => {
    try {
      await deleteOrg.mutateAsync(orgId);
      showSuccessToast("deleted", "Organization");
      setShowConfirm(false);
    } catch (error) {
      showErrorToast(
        "deleteFailed",
        "Organization",
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setShowConfirm(true)}>
        Delete
      </Button>
      <ConfirmationModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        action="delete"
        itemName="Organization"
        itemValue={orgName}
        onConfirm={handleDelete}
        isLoading={deleteOrg.isPending}
      />
    </>
  );
}
```

### Example 2: Using the Hook

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { useConfirmation } from "@/hooks/use-confirmation";
import { useDeleteOrganization } from "@/lib/api/hooks/use-organizations";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";

export function DeleteOrganizationButton({ orgId, orgName }: { orgId: string; orgName: string }) {
  const deleteOrg = useDeleteOrganization();

  const { showConfirm, confirmProps } = useConfirmation({
    action: "delete",
    itemName: "Organization",
    onConfirm: async () => {
      try {
        await deleteOrg.mutateAsync(orgId);
        showSuccessToast("deleted", "Organization");
      } catch (error) {
        showErrorToast(
          "deleteFailed",
          "Organization",
          error instanceof Error ? error.message : undefined,
        );
        throw error; // Re-throw to prevent modal from closing
      }
    },
  });

  return (
    <>
      <Button variant="destructive" onClick={() => showConfirm(orgName)}>
        Delete
      </Button>
      <ConfirmationModal {...confirmProps} isLoading={deleteOrg.isPending} />
    </>
  );
}
```

### Example 3: Update Operation

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";

export function UpdateButton({ onUpdate }: { onUpdate: () => Promise<void> }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await onUpdate();
      showSuccessToast("updated", "Settings");
      setShowConfirm(false);
    } catch (error) {
      showErrorToast(
        "updateFailed",
        "Settings",
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setShowConfirm(true)}>Update</Button>
      <ConfirmationModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        action="update"
        itemName="Settings"
        onConfirm={handleUpdate}
        isLoading={isLoading}
      />
    </>
  );
}
```

### Example 4: Custom Action

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";

export function ArchiveButton({ itemId, itemName }: { itemId: string; itemName: string }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleArchive = async () => {
    try {
      await archiveItem(itemId);
      showSuccessToast("archived", "Item");
      setShowConfirm(false);
    } catch (error) {
      showErrorToast("archiveFailed", "Item");
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setShowConfirm(true)}>
        Archive
      </Button>
      <ConfirmationModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        action="archive"
        itemName="Item"
        itemValue={itemName}
        onConfirm={handleArchive}
        title="Archive Item"
        description={`Are you sure you want to archive "${itemName}"? You can restore it later.`}
      />
    </>
  );
}
```

## Toast Message Examples

### Example 1: Success Messages

```tsx
import { showSuccessToast } from "@/lib/utils/toast";

// After creating an organization
showSuccessToast("created", "Organization");

// After updating settings
showSuccessToast("updated", "Settings");

// After deleting a data source
showSuccessToast("deleted", "Data Source");

// After connecting to a database
showSuccessToast("connected", "Database");
```

### Example 2: Error Messages

```tsx
import { showErrorToast } from "@/lib/utils/toast";

try {
  await createOrganization(data);
  showSuccessToast("created", "Organization");
} catch (error) {
  showErrorToast(
    "createFailed",
    "Organization",
    error instanceof Error ? error.message : undefined,
  );
}
```

### Example 3: Using Toast Directly with Common Messages

```tsx
import { toast, toastMessages } from "@/lib/utils/toast";

// Get message object
const message = toastMessages.success.created("Organization");
toast.success(message.message, message.description);

// Or inline
toast.success(
  toastMessages.success.created("Organization").message,
  toastMessages.success.created("Organization").description,
);
```

### Example 4: Promise Toast

```tsx
import { toast } from "@/lib/utils/toast";

const promise = createOrganization(data);

toast.promise(promise, {
  loading: "Creating organization...",
  success: (data) => `Organization "${data.name}" created successfully!`,
  error: (error) => `Failed to create organization: ${error.message}`,
});
```

## Complete Example: Full CRUD with Confirmation

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { useConfirmation } from "@/hooks/use-confirmation";
import {
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
} from "@/lib/api/hooks/use-organizations";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";

export function OrganizationActions() {
  const createOrg = useCreateOrganization();
  const updateOrg = useUpdateOrganization();
  const deleteOrg = useDeleteOrganization();

  // Delete confirmation
  const deleteConfirm = useConfirmation({
    action: "delete",
    itemName: "Organization",
    onConfirm: async () => {
      try {
        await deleteOrg.mutateAsync(orgId);
        showSuccessToast("deleted", "Organization");
      } catch (error) {
        showErrorToast("deleteFailed", "Organization");
        throw error;
      }
    },
  });

  const handleCreate = async () => {
    try {
      await createOrg.mutateAsync({ name: "New Org" });
      showSuccessToast("created", "Organization");
    } catch (error) {
      showErrorToast("createFailed", "Organization");
    }
  };

  const handleUpdate = async () => {
    try {
      await updateOrg.mutateAsync({ id: orgId, data: { name: "Updated" } });
      showSuccessToast("updated", "Organization");
    } catch (error) {
      showErrorToast("updateFailed", "Organization");
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={handleCreate}>Create</Button>
        <Button onClick={handleUpdate}>Update</Button>
        <Button
          variant="destructive"
          onClick={() => deleteConfirm.showConfirm("My Organization")}
        >
          Delete
        </Button>
      </div>
      <ConfirmationModal {...deleteConfirm.confirmProps} isLoading={deleteOrg.isPending} />
    </>
  );
}
```
