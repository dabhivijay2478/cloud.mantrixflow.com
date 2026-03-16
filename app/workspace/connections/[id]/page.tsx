"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getIconComponent } from "@/components/data-sources";
import { getDatabaseById } from "@/config/database-registry";
import {
  useConnection,
  useConnections,
  useTestConnection,
} from "@/lib/api";
import { useDeleteDataSource } from "@/lib/api/hooks/use-data-source";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";
import { LoadingState } from "@/components/shared";

export default function ConnectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const connectionId = params?.id as string;
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  const { data: connection, isLoading } = useConnection(organizationId, connectionId);
  const { data: connections } = useConnections(organizationId);
  const testConnection = useTestConnection(organizationId, connectionId);
  const deleteDataSource = useDeleteDataSource(organizationId);

  const conn = connections?.find((c) => c.id === connectionId);
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this connection?")) return;
    try {
      await deleteDataSource.mutateAsync(connectionId);
      toast.success("Connection deleted");
      router.push("/workspace/connections");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  if (!organizationId) {
    return null;
  }

  if (isLoading || !conn) {
    return <LoadingState />;
  }

  const config = (connection as unknown as { config?: Record<string, unknown> })?.config ?? {};
  const isSource = (conn.connectorRole ?? "source") === "source";

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
            <h1 className="text-2xl font-semibold">{conn.name}</h1>
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
          <Button variant="destructive" onClick={handleDelete}>
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
    </div>
  );
}
