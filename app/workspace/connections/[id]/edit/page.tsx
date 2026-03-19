"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CredentialForm } from "../../components/CredentialForm";
import { RoleToggle } from "../../components/RoleToggle";
import { getConnectorById } from "../../data/connectors";
import { useConnections } from "@/lib/api";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export default function EditConnectionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;
  const id = params?.id as string;
  const role =
    (searchParams.get("role") as "source" | "destination") ?? "source";

  const { data: apiConnections } = useConnections(organizationId);
  const connection = apiConnections?.find((c) => c.id === id);
  const connector = connection
    ? getConnectorById((connection.type as string) ?? "postgres")
    : null;

  if (!connection || !connector) {
    return (
      <div className="space-y-6">
        <Link
          href="/workspace/connections"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          ← Back to Connections
        </Link>
        <p className="text-muted-foreground">
          Connection not found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/workspace/connections"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-sm"
          >
            ← Back to Connections
          </Link>
          <h1 className="text-2xl font-semibold">
            Edit {role === "source" ? "Source" : "Destination"} Connection —{" "}
            {connector.displayName}
          </h1>
        </div>
        <RoleToggle value={role} />
      </div>

      <CredentialForm
        connector={connector}
        role={role}
        connectionId={connection.id}
        isEdit
        organizationId={organizationId}
      />
    </div>
  );
}
