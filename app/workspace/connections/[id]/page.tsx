"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getIconComponent } from "@/components/data-sources";
import { getDatabaseById } from "@/config/database-registry";
import {
  useConnection,
  useConnections,
  useTestConnection,
} from "@/lib/api";
import {
  useCdcStatus,
  useDeleteDataSource,
  useUpdateDataSource,
} from "@/lib/api/hooks/use-data-source";
import { usePipelines } from "@/lib/api/hooks/use-data-pipelines";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";
import { ConfirmationModal, LoadingState } from "@/components/shared";

export default function ConnectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const connectionId = params?.id as string;
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  const { data: connection, isLoading } = useConnection(organizationId, connectionId);
  const { data: connections } = useConnections(organizationId);
  const conn = connections?.find((c) => c.id === connectionId);
  const isSource = (conn?.connectorRole ?? "source") === "source";
  const isPostgres = ((conn?.type ?? (conn as { sourceType?: string })?.sourceType) ?? "").toLowerCase() === "postgres";

  const { data: pipelines } = usePipelines(organizationId);
  const { data: cdcStatus } = useCdcStatus(
    organizationId,
    connectionId,
    !!conn && isSource && isPostgres,
  );
  const testConnection = useTestConnection(organizationId, connectionId);
  const deleteDataSource = useDeleteDataSource(organizationId);
  const updateDataSource = useUpdateDataSource(organizationId, connectionId);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const pipelinesUsingConnection = useCallback(() => {
    if (!pipelines || !connectionId) return [];
    return pipelines.filter(
      (p) =>
        p.sourceSchema?.dataSourceId === connectionId ||
        p.destinationSchema?.dataSourceId === connectionId,
    );
  }, [pipelines, connectionId]);

  const linkedPipelines = pipelinesUsingConnection();
  const registry = conn ? getDatabaseById(conn.type || "postgres") : null;
  const displayName = registry?.displayName ?? conn?.type ?? "Connection";

  const handleTest = async () => {
    try {
      const result = await testConnection.mutateAsync();
      if (result?.success) {
        toast.success(result.message ?? "Connection test passed");
      } else {
        toast.error(result?.message ?? result?.error ?? "Connection test failed");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test failed");
    }
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);

  const handleDeleteConfirm = async () => {
    try {
      await deleteDataSource.mutateAsync(connectionId);
      toast.success("Connection deleted");
      setShowDeleteConfirm(false);
      router.push("/workspace/connections");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
      throw e;
    }
  };

  const pipelineCount = linkedPipelines.length;

  if (!organizationId) {
    return null;
  }

  if (isLoading || !conn) {
    return <LoadingState />;
  }

  const config = (connection as unknown as { config?: Record<string, unknown> })?.config ?? {};

  const handleSaveName = async () => {
    const name = (nameValue || conn.name || "").trim();
    if (!name) return;
    try {
      await updateDataSource.mutateAsync({ name });
      toast.success("Name updated");
      setEditingName(false);
      setNameValue("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update name");
    }
  };

  const handleStartEditName = () => {
    setNameValue(conn.name || "");
    setEditingName(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/workspace/connections">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
            {getIconComponent(registry?.icon ?? "postgres", 24)}
          </div>
          <div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") {
                      setEditingName(false);
                      setNameValue("");
                    }
                  }}
                  className="h-8 w-64 text-lg font-semibold"
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">{conn.name}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleStartEditName}
                  aria-label="Edit name"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex gap-2 mt-1">
              <Badge variant="outline">
                {(conn.connectorRole ?? "source") === "source" ? "SOURCE" : "DEST"}
              </Badge>
              <Badge variant={conn.status === "active" ? "default" : "secondary"}>
                {conn.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTest}>
            Test Connection
          </Button>
          {isSource && (
            <Link href={`/workspace/data-sources/${connectionId}/query`}>
              <Button variant="outline">Discover Tables</Button>
            </Link>
          )}
          <Link href={`/workspace/connections/${connectionId}/edit`}>
            <Button variant="outline">Edit Credentials</Button>
          </Link>
          <Button variant="destructive" onClick={handleDeleteClick}>
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Type:</span> {displayName}
          </p>
          {config.host != null && config.host !== "" && (
            <p>
              <span className="text-muted-foreground">Host:</span> {String(config.host)}:
              {String(config.port ?? 5432)}
            </p>
          )}
          {config.database != null && config.database !== "" && (
            <p>
              <span className="text-muted-foreground">Database:</span> {String(config.database)}
            </p>
          )}
          {config.schema != null && config.schema !== "" && (
            <p>
              <span className="text-muted-foreground">Schema:</span> {String(config.schema)}
            </p>
          )}
          <p>
            <span className="text-muted-foreground">Password:</span> ••••••••
          </p>
        </CardContent>
      </Card>

      {linkedPipelines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pipelines</CardTitle>
            <p className="text-sm text-muted-foreground">
              Used in {linkedPipelines.length} pipeline{linkedPipelines.length !== 1 ? "s" : ""}
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {linkedPipelines.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/workspace/data-pipelines/${p.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {isSource && isPostgres && cdcStatus && (
        <Card>
          <CardHeader>
            <CardTitle>CDC Status</CardTitle>
            <p className="text-sm text-muted-foreground">
              Prerequisites for log-based replication (PostgreSQL)
            </p>
          </CardHeader>
          <CardContent>
            {cdcStatus.cdc_prerequisites_status ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <Badge
                    variant={
                      cdcStatus.cdc_prerequisites_status.overall === "verified"
                        ? "default"
                        : cdcStatus.cdc_prerequisites_status.overall === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {cdcStatus.cdc_prerequisites_status.overall}
                  </Badge>
                </p>
                {cdcStatus.cdc_prerequisites_status.wal_level_ok != null && (
                  <p>
                    <span className="text-muted-foreground">wal_level:</span>{" "}
                    {cdcStatus.cdc_prerequisites_status.wal_level_ok ? "✓" : "✗"}
                  </p>
                )}
                {cdcStatus.cdc_prerequisites_status.replication_role_ok != null && (
                  <p>
                    <span className="text-muted-foreground">Replication role:</span>{" "}
                    {cdcStatus.cdc_prerequisites_status.replication_role_ok ? "✓" : "✗"}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">CDC status not available</p>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        action="delete"
        itemName="Connection"
        itemValue={conn.name}
        description={
          pipelineCount > 0
            ? `"${conn.name}" is used in ${pipelineCount} pipeline${pipelineCount !== 1 ? "s" : ""}. Deleting will break those pipelines. Are you sure you want to delete?`
            : undefined
        }
        onConfirm={handleDeleteConfirm}
        isLoading={deleteDataSource.isPending}
      />
    </div>
  );
}
