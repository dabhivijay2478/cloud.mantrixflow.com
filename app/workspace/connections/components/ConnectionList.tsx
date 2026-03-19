"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ConnectionDisplay } from "../types";
import { ConnectionListRow } from "./ConnectionListRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useDeleteDataSource,
  useDisconnectConnection,
  useReconnectConnection,
  useTestConnectionForDataSource,
} from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";

type ListRoleFilter = "all" | "source" | "destination";

interface ConnectionListProps {
  connections?: ConnectionDisplay[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  roleFilter: ListRoleFilter;
  onRoleFilterChange: (role: ListRoleFilter) => void;
  organizationId?: string;
  className?: string;
}

export function ConnectionList({
  connections = [],
  selectedId,
  onSelect,
  roleFilter,
  onRoleFilterChange,
  organizationId,
  className,
}: ConnectionListProps) {
  const router = useRouter();
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(
    null,
  );

  const testConnection = useTestConnectionForDataSource(organizationId);
  const deleteDataSource = useDeleteDataSource(organizationId);
  const disconnectConnection = useDisconnectConnection(organizationId);
  const reconnectConnection = useReconnectConnection(organizationId);
  const [search, setSearch] = useState("");

  const handleTest = async (id: string) => {
    if (!organizationId) return;
    try {
      const result = await testConnection.mutateAsync(id);
      if (result.success) {
        showSuccessToast("connected", "Connection");
      } else {
        showErrorToast("connectFailed", "Connection", result.error);
      }
    } catch (err) {
      showErrorToast(
        "connectFailed",
        "Connection",
        err instanceof Error ? err.message : undefined,
      );
    }
  };

  const handleDiscover = (id: string) => {
    router.push(`/workspace/data-sources/${id}/query`);
  };

  const handleDisconnect = async (id: string) => {
    if (!organizationId) return;
    try {
      await disconnectConnection.mutateAsync(id);
      showSuccessToast("disconnected", "Connection");
      onSelect(null);
      router.refresh();
    } catch (err) {
      showErrorToast(
        "disconnectFailed",
        "Connection",
        err instanceof Error ? err.message : undefined,
      );
    }
  };

  const handleReconnect = async (id: string) => {
    if (!organizationId) return;
    try {
      const result = await reconnectConnection.mutateAsync(id);
      const success = result && typeof result === "object" && "success" in result && (result as { success?: boolean }).success;
      if (success) {
        showSuccessToast("reconnected", "Connection");
        onSelect(null);
        router.refresh();
      } else {
        showErrorToast(
          "reconnectFailed",
          "Connection",
          (result as { error?: string })?.error,
        );
      }
    } catch (err) {
      showErrorToast(
        "reconnectFailed",
        "Connection",
        err instanceof Error ? err.message : undefined,
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!connectionToDelete || !organizationId) return;
    try {
      await deleteDataSource.mutateAsync(connectionToDelete);
      showSuccessToast("deleted", "Connection");
      setConnectionToDelete(null);
      onSelect(null);
    } catch (err) {
      showErrorToast(
        "deleteFailed",
        "Data Source",
        err instanceof Error ? err.message : undefined,
      );
    }
  };

  const connectionToDeleteDisplay = connectionToDelete
    ? connections.find((c) => c.id === connectionToDelete)
    : null;

  const filtered = useMemo(() => {
    let list = connections;
    if (roleFilter === "source") {
      list = list.filter((c) => c.role === "source");
    } else if (roleFilter === "destination") {
      list = list.filter((c) => c.role === "destination");
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [connections, roleFilter, search]);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Connections</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your source and destination database connections.
          </p>
        </div>
        <Button asChild>
          <Link href="/workspace/connections/new">+ New Connection</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "source", "destination"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRoleFilterChange(r)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                roleFilter === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {r === "all" ? "All" : r === "source" ? "Sources" : "Destinations"}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search connections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            {search
              ? `No connections match "${search}"`
              : roleFilter === "all"
                ? "No connections yet."
                : `No ${roleFilter} connections.`}
          </p>
        ) : (
          filtered.map((conn) => (
            <ConnectionListRow
              key={conn.id}
              connection={conn}
              onClick={() => onSelect(conn.id)}
              isSelected={selectedId === conn.id}
              onTest={() => handleTest(conn.id)}
              onDiscover={() => handleDiscover(conn.id)}
              onDisconnect={() => handleDisconnect(conn.id)}
              onReconnect={() => handleReconnect(conn.id)}
              onEdit={() => router.push(`/workspace/connections/${conn.id}/edit`)}
              onDelete={() => setConnectionToDelete(conn.id)}
            />
          ))
        )}
      </div>

      <AlertDialog
        open={!!connectionToDelete}
        onOpenChange={(open) => !open && setConnectionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete connection?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete
              &quot;{connectionToDeleteDisplay?.name ?? "this connection"}&quot;.
              Pipelines using this connection may fail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteDataSource.isPending}
            >
              {deleteDataSource.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
