"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ConnectionWizard } from "@/components/connections";
import { useCreateConnection } from "@/lib/api";
import { useTestConnection } from "@/lib/api/hooks/use-data-sources";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { getApiErrorMessage } from "@/lib/api/error-handler";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import type { ConnectionRole } from "@/components/connections";

export default function NewConnectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  const roleParam = searchParams.get("role");
  const initialRole: ConnectionRole =
    roleParam === "destination" ? "destination" : "source";

  const createConnection = useCreateConnection(organizationId, {
    showToastOnError: false,
  });
  const testConnection = useTestConnection(organizationId);

  useEffect(() => {
    if (!organizationId) {
      showErrorToast(
        "notFound",
        "Organization",
        "Please select an organization from the sidebar before adding a connection.",
      );
      router.replace("/workspace/connections");
    }
  }, [organizationId, router]);

  const handleCreate = async (data: Parameters<typeof createConnection.mutateAsync>[0]) => {
    if (!organizationId) throw new Error("Organization required");
    await createConnection.mutateAsync(data);
    showSuccessToast("connected", "Connection created");
  };

  const handleTestConnection = async (data: {
    type: string;
    config: Record<string, unknown>;
  }) => {
    const testData = {
      type: data.type,
      host: data.config.host,
      port: data.config.port,
      database: data.config.database,
      username: data.config.username,
      password: data.config.password,
      ssl: data.config.ssl,
      schema: data.config.schema,
      path: data.config.path,
    };
    const result = await testConnection.mutateAsync(testData as never);
    return {
      success: result.success ?? !result.error,
      error: result.error,
    };
  };

  const handleSuccess = () => {
    router.push(`/workspace/connections?role=${initialRole}`);
  };

  if (!organizationId) {
    return null;
  }

  return (
    <div className="max-w-2xl">
      <ConnectionWizard
        organizationId={organizationId}
        initialRole={initialRole}
        onCreate={handleCreate}
        onTestConnection={handleTestConnection}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
