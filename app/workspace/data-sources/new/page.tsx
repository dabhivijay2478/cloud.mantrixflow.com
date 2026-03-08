"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AddConnectorContent } from "@/components/data-sources";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { showErrorToast } from "@/lib/utils/toast";

export default function AddConnectorPage() {
  const router = useRouter();
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  useEffect(() => {
    if (!organizationId) {
      showErrorToast(
        "notFound",
        "Organization",
        "Please select an organization from the sidebar before adding a connector.",
      );
      router.replace("/workspace/data-sources");
    }
  }, [organizationId, router]);

  if (!organizationId) {
    return null;
  }

  return (
    <AddConnectorContent
      organizationId={organizationId}
      onSuccess={() => router.push("/workspace/data-sources")}
    />
  );
}
