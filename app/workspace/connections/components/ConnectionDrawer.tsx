"use client";

import {
  Database,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ConnectionDisplay } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useDeleteDataSource,
  useDisconnectConnection,
  useReconnectConnection,
  useTestConnectionForDataSource,
} from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";

interface ConnectionDrawerProps {
  connection: ConnectionDisplay | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
}

export function ConnectionDrawer({
  connection,
  open,
  onOpenChange,
  organizationId,
}: ConnectionDrawerProps) {
  const router = useRouter();
  const [cdcExpanded, setCdcExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [name, setName] = useState(connection?.name ?? "");
  const [description, setDescription] = useState("");

  const testConnection = useTestConnectionForDataSource(organizationId);
  const deleteDataSource = useDeleteDataSource(organizationId);
  const disconnectConnection = useDisconnectConnection(organizationId);
  const reconnectConnection = useReconnectConnection(organizationId);

  useEffect(() => {
    if (connection) {
      setName(connection.name);
    }
  }, [connection?.id, connection?.name]);

  if (!connection) return null;

  const isPostgresSource =
    connection.type === "postgres" && connection.role === "source";

  const handleTest = async () => {
    setTestResult(null);
    if (!organizationId) return;
    try {
      const result = await testConnection.mutateAsync(connection.id);
      setTestResult(result.success ? "success" : "error");
      if (result.success) {
        showSuccessToast("connected", "Connection");
      } else {
        showErrorToast("connectFailed", "Connection", result.error);
      }
    } catch (err) {
      setTestResult("error");
      showErrorToast(
        "connectFailed",
        "Connection",
        err instanceof Error ? err.message : undefined,
      );
    }
  };

  const handleDisconnect = async () => {
    if (!organizationId) return;
    try {
      await disconnectConnection.mutateAsync(connection.id);
      showSuccessToast("disconnected", "Connection");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      showErrorToast(
        "disconnectFailed",
        "Connection",
        err instanceof Error ? err.message : undefined,
      );
    }
  };

  const handleReconnect = async () => {
    if (!organizationId) return;
    try {
      const result = await reconnectConnection.mutateAsync(connection.id);
      const success = result && typeof result === "object" && "success" in result && (result as { success?: boolean }).success;
      if (success) {
        showSuccessToast("reconnected", "Connection");
        onOpenChange(false);
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

  const handleDelete = async () => {
    if (!organizationId) return;
    try {
      await deleteDataSource.mutateAsync(connection.id);
      showSuccessToast("deleted", "Connection");
      setDeleteDialogOpen(false);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      showErrorToast(
        "deleteFailed",
        "Data Source",
        err instanceof Error ? err.message : undefined,
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[520px] max-w-[90vw] flex-col gap-0 p-0 sm:max-w-[520px]"
      >
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded bg-muted">
              <Database className="size-3.5 text-muted-foreground" />
            </div>
            <SheetTitle className="flex items-center gap-2">
              {connection.name}
              <Badge variant="outline" className="text-xs uppercase">
                {connection.role === "source" ? "SOURCE" : "DEST"}
              </Badge>
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-normal",
                  connection.status === "active"
                    ? "text-green-600 dark:text-green-400"
                    : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    connection.status === "active"
                      ? "bg-green-500"
                      : "bg-muted-foreground",
                  )}
                />
                {connection.status === "active" ? "Active" : "Inactive"}
              </span>
            </SheetTitle>
          </div>
          <SheetDescription>
            {connection.type} · {connection.hostSummary}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="flex flex-1 flex-col overflow-auto px-6 pb-6">
          <TabsList className="mt-4 w-full shrink-0">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="pipelines" className="flex-1">
              Pipelines
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-muted-foreground break-all text-sm">
                <span className="font-medium text-foreground">Host:</span>{" "}
                {connection.hostSummary}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={testConnection.isPending}
              >
                {testConnection.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Test Connection"
                )}
              </Button>
              {testResult === "success" && (
                <p className="text-green-600 text-sm dark:text-green-400">
                  ✓ Connected · {connection.type}
                </p>
              )}

              {connection.lastTestResult === "success" && connection.lastTestTime && (
                <p className="text-muted-foreground text-xs">
                  Last test: ✓ {connection.lastTestTime}
                </p>
              )}
            </div>

            {connection.role === "source" && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-fit"
              >
                <Link href={`/workspace/data-sources/${connection.id}/query`}>
                  Discover Tables →
                </Link>
              </Button>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisconnect()}
                disabled={
                  connection.status !== "active" || disconnectConnection.isPending
                }
              >
                {disconnectConnection.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Disconnect"
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReconnect()}
                disabled={
                  connection.status !== "inactive" || reconnectConnection.isPending
                }
              >
                {reconnectConnection.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Reconnect"
                )}
              </Button>
            </div>

            {isPostgresSource && (
              <div className="rounded-lg border p-4">
                <button
                  type="button"
                  onClick={() => setCdcExpanded(!cdcExpanded)}
                  className="flex w-full items-center justify-between text-left text-sm font-medium"
                >
                  Change Data Capture (CDC)
                  {cdcExpanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </button>
                {cdcExpanded && (
                  <div className="mt-3 space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      WAL Level: logical ✓
                    </p>
                    <p className="text-muted-foreground">
                      Replication Role: granted ✓
                    </p>
                    <p className="text-muted-foreground">
                      Slot Name: mxf_abc12345
                    </p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Re-check prerequisites
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/workspace/connections/${connection.id}/cdc-setup`}
                        >
                          CDC Setup
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pipelines" className="mt-6">
            {connection.pipelineCount === 0 ? (
              <p className="text-muted-foreground mt-4 text-sm">
                Not used in any pipelines yet.
              </p>
            ) : (
              <div className="space-y-2">
                {Array.from({ length: Math.min(connection.pipelineCount, 3) }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          Pipeline {i + 1}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Last run: 2 hrs ago
                        </p>
                      </div>
                      <Link href="/workspace/data-pipelines">
                        <Button variant="ghost" size="sm">
                          View pipeline →
                        </Button>
                      </Link>
                    </div>
                  ),
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="drawer-name">Name</Label>
              <Input
                id="drawer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drawer-desc">Description</Label>
              <Textarea
                id="drawer-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/workspace/connections/${connection.id}/edit`}>
                Edit Credentials
              </Link>
            </Button>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={
                  connection.status !== "active" || disconnectConnection.isPending
                }
              >
                {disconnectConnection.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Disconnect"
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReconnect}
                disabled={
                  connection.status !== "inactive" || reconnectConnection.isPending
                }
              >
                {reconnectConnection.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Reconnect"
                )}
              </Button>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete Connection
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete connection?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{connection.name}&quot;.
                    Pipelines using this connection may fail.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteDataSource.isPending}
                  >
                    {deleteDataSource.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
