"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ConnectionCard } from "@/components/connections";
import { ConfirmationModal, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConnections } from "@/lib/api";
import { ConnectionService } from "@/lib/api/services/connection.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDeleteDataSource } from "@/lib/api/hooks/use-data-source";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";
import { useConfirmation } from "@/hooks/use-confirmation";

type RoleFilter = "all" | "source" | "destination";

export default function ConnectionsPage() {
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") as RoleFilter | null;
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(roleParam || "all");

  const queryClient = useQueryClient();
  const { data: connections, isLoading } = useConnections(organizationId);
  const testConnection = useMutation({
    mutationFn: (dataSourceId: string) =>
      ConnectionService.testConnection(organizationId!, dataSourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-sources", "connections"] });
    },
  });
  const deleteDataSource = useDeleteDataSource(organizationId);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredConnections = useMemo(() => {
    if (!connections) return [];
    if (roleFilter === "all") return connections;
    return connections.filter(
      (c) => (c.connectorRole ?? "source") === roleFilter,
    );
  }, [connections, roleFilter]);

  const mappedConnections = useMemo(
    () =>
      filteredConnections.map((conn) => ({
        id: conn.id,
        name: conn.name,
        type: (conn.type || "postgres") as string,
        connectorRole: (conn.connectorRole ?? "source") as "source" | "destination",
        status: (conn.status === "active"
          ? "active"
          : conn.status === "error"
            ? "error"
            : "inactive") as "active" | "inactive" | "error",
        lastConnectedAt:
          conn.lastConnectedAt instanceof Date
            ? conn.lastConnectedAt.toISOString()
            : conn.lastConnectedAt,
        createdAt:
          conn.createdAt instanceof Date
            ? conn.createdAt.toISOString()
            : String(conn.createdAt ?? ""),
        pipelineCount: undefined,
        config: (conn as { config?: { host?: string; port?: number; database?: string } }).config,
      })),
    [filteredConnections],
  );

  const deleteConfirm = useConfirmation({
    action: "delete",
    itemName: "Connection",
    onConfirm: async () => {
      if (!deletingId) return;
      try {
        await deleteDataSource.mutateAsync(deletingId);
        toast.success("Connection deleted");
        setDeletingId(null);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete");
        throw e;
      }
    },
  });

  const handleTest = async (id: string) => {
    try {
      const result = await testConnection.mutateAsync(id);
      if (result?.success) {
        toast.success(result.message ?? "Connection test passed");
      } else {
        toast.error(result?.message ?? "Connection test failed");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test failed");
    }
  };

  const handleDiscover = async (id: string) => {
    toast.success("Discover triggered");
  };

  const handleEdit = (id: string) => {
    window.location.href = `/workspace/connections/${id}`;
  };

  const handleDelete = (id: string) => {
    const conn = mappedConnections.find((c) => c.id === id);
    setDeletingId(id);
    deleteConfirm.showConfirm(conn?.name);
  };

  const handleTabChange = (v: string) => {
    const filter = v as RoleFilter;
    setRoleFilter(filter);
    const url = new URL(window.location.href);
    if (filter === "all") {
      url.searchParams.delete("role");
    } else {
      url.searchParams.set("role", filter);
    }
    window.history.replaceState({}, "", url.toString());
  };

  if (!organizationId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Connections"
        description="Manage your source and destination database connections"
        action={
          <Button asChild className="cursor-pointer">
            <Link href="/workspace/connections/new">
              <Plus className="mr-2 h-4 w-4" />
              New Connection
            </Link>
          </Button>
        }
      />

      <Tabs value={roleFilter} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="source">Sources</TabsTrigger>
          <TabsTrigger value="destination">Destinations</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="text-muted-foreground">Loading connections...</div>
      ) : mappedConnections.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <p className="mb-4">No connections yet.</p>
          <Link href="/workspace/connections/new">
            <Button>Create your first connection</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {mappedConnections.map((conn) => (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              onTest={handleTest}
              onDiscover={conn.connectorRole === "source" ? handleDiscover : undefined}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isSource={conn.connectorRole === "source"}
            />
          ))}
        </div>
      )}

      <ConfirmationModal
        open={deleteConfirm.confirmProps.open}
        onOpenChange={(open) => {
          if (!open) {
            deleteConfirm.hideConfirm();
            setDeletingId(null);
          }
        }}
        action={deleteConfirm.confirmProps.action}
        itemName={deleteConfirm.confirmProps.itemName}
        itemValue={deleteConfirm.confirmProps.itemValue}
        onConfirm={deleteConfirm.confirmProps.onConfirm}
        isLoading={deleteDataSource.isPending}
      />
    </div>
  );
}
