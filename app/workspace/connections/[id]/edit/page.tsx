"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDatabaseById } from "@/config/database-registry";
import { getIconComponent } from "@/components/data-sources";
import { useConnection } from "@/lib/api";
import { useUpdateConnection } from "@/lib/api/hooks/use-connection";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";
import { LoadingState } from "@/components/shared";

export default function EditConnectionPage() {
  const params = useParams();
  const router = useRouter();
  const connectionId = params?.id as string;
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  const { data: connection, isLoading } = useConnection(
    organizationId,
    connectionId,
    true, // includeSensitive for editing
  );
  const updateConnection = useUpdateConnection(organizationId, connectionId);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const config = (connection?.config ?? {}) as Record<string, unknown>;
  const registry = connection
    ? getDatabaseById((connection.connection_type as string) || "postgres")
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId || !connectionId) return;
    const updateConfig: Record<string, unknown> = { ...config };
    if (formData.host !== undefined) updateConfig.host = formData.host;
    if (formData.port) updateConfig.port = parseInt(formData.port, 10);
    if (formData.database !== undefined) updateConfig.database = formData.database;
    if (formData.username !== undefined) updateConfig.username = formData.username;
    if (formData.password) updateConfig.password = formData.password;
    if (formData.schema !== undefined) updateConfig.schema = formData.schema;
    if (formData.path !== undefined) updateConfig.path = formData.path;
    try {
      await updateConnection.mutateAsync({
        config: updateConfig as never,
      });
      toast.success("Credentials updated");
      router.push(`/workspace/connections/${connectionId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  if (!organizationId) return null;
  if (isLoading || !connection) return <LoadingState />;

  const type = (connection.connection_type as string) || "postgres";
  const isSqlite = type === "sqlite";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href={`/workspace/connections/${connectionId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
            {getIconComponent(registry?.icon ?? "postgres", 24)}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Edit Credentials</h1>
            <p className="text-sm text-muted-foreground">
              Update connection configuration
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSqlite ? (
              <div className="space-y-2">
                <Label htmlFor="path">File Path</Label>
                <Input
                  id="path"
                  defaultValue={String(config.path ?? "")}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, path: e.target.value }))
                  }
                  placeholder="/path/to/database.sqlite3"
                />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input
                      id="host"
                      defaultValue={String(config.host ?? "")}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, host: e.target.value }))
                      }
                      placeholder="localhost"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      defaultValue={String(config.port ?? 5432)}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, port: e.target.value }))
                      }
                      placeholder="5432"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database">Database</Label>
                  <Input
                    id="database"
                    defaultValue={String(config.database ?? "")}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, database: e.target.value }))
                    }
                    placeholder="mydb"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      defaultValue={String(config.username ?? "")}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, username: e.target.value }))
                      }
                      placeholder="user"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="•••••••• (leave blank to keep current)"
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, password: e.target.value }))
                      }
                    />
                  </div>
                </div>
                {registry?.showSchema && (
                  <div className="space-y-2">
                    <Label htmlFor="schema">Schema</Label>
                    <Input
                      id="schema"
                      defaultValue={String(config.schema ?? "public")}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, schema: e.target.value }))
                      }
                      placeholder="public"
                    />
                  </div>
                )}
              </>
            )}
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={updateConnection.isPending}>
                {updateConnection.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
              <Link href={`/workspace/connections/${connectionId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
