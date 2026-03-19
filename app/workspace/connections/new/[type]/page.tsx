"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CredentialForm } from "../../components/CredentialForm";
import { RoleToggle } from "../../components/RoleToggle";
import { getConnectorById } from "../../data/connectors";

export default function NewConnectionFormPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const type = params?.type as string;
  const role =
    (searchParams.get("role") as "source" | "destination") ?? "source";

  const connector = type ? getConnectorById(type) : null;

  if (!connector || connector.wave > 1) {
    return (
      <div className="space-y-6">
        <Link
          href="/workspace/connections/new"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          ← Choose connector
        </Link>
        <p className="text-muted-foreground">
          Connector &quot;{type}&quot; not found or not yet available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/workspace/connections/new"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-sm"
          >
            ← Choose connector
          </Link>
          <h1 className="text-2xl font-semibold">
            New {role === "source" ? "Source" : "Destination"} Connection —{" "}
            {connector.displayName}
          </h1>
        </div>
        <RoleToggle value={role} />
      </div>

      <CredentialForm connector={connector} role={role} />
    </div>
  );
}
