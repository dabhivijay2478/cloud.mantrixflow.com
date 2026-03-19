"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ConnectorCatalog } from "../components/ConnectorCatalog";

export default function NewConnectionCatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role =
    (searchParams.get("role") as "source" | "destination") ?? "source";

  return (
    <ConnectorCatalog
      role={role}
      showRoleToggle
      showBackButton
      onBack={() => router.push("/workspace/connections")}
      title="New Connection"
      description="Choose the database or service to connect to."
    />
  );
}
