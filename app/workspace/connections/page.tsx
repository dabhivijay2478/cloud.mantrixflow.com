"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ConnectorCatalog } from "./components/ConnectorCatalog";
import { ConnectionDrawer } from "./components/ConnectionDrawer";
import { ConnectionList } from "./components/ConnectionList";
import { MOCK_CONNECTIONS } from "./data/mockConnections";

export default function ConnectionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") as "source" | "destination" | null;
  const listRole =
    roleParam === "source"
      ? "source"
      : roleParam === "destination"
        ? "destination"
        : "all";

  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);
  const [listRoleFilter, setListRoleFilter] = useState<
    "all" | "source" | "destination"
  >(listRole === "all" ? "all" : listRole);

  const connections = MOCK_CONNECTIONS;
  const hasConnections = connections.length > 0;

  useEffect(() => {
    setListRoleFilter(listRole === "all" ? "all" : listRole);
  }, [listRole]);

  const selectedConnection = useMemo(
    () => connections.find((c) => c.id === selectedConnectionId) ?? null,
    [connections, selectedConnectionId],
  );

  const handleRoleFilterChange = (role: "all" | "source" | "destination") => {
    setListRoleFilter(role);
    const params = new URLSearchParams(searchParams.toString());
    if (role === "all") {
      params.delete("role");
    } else {
      params.set("role", role);
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  if (!hasConnections) {
    const role =
      (searchParams.get("role") as "source" | "destination") ?? "source";
    return (
      <ConnectorCatalog
        role={role}
        showRoleToggle
        title="Connections"
        description="Connect your first database to start building pipelines."
      />
    );
  }

  return (
    <>
      <ConnectionList
        connections={connections}
        selectedId={selectedConnectionId}
        onSelect={setSelectedConnectionId}
        roleFilter={listRoleFilter}
        onRoleFilterChange={handleRoleFilterChange}
      />
      <ConnectionDrawer
        connection={selectedConnection}
        open={selectedConnectionId !== null}
        onOpenChange={(open) => !open && setSelectedConnectionId(null)}
      />
    </>
  );
}
