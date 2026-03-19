"use client";

import { Database, RefreshCw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { IncomingDataTreeView } from "@/components/data-pipelines";
import {
  useDiscoverSourceSchema,
  usePreviewSourceData,
} from "@/lib/api/hooks/use-source-schemas";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";
import { usePipelineBuilderStore } from "../store/pipelineStore";

export function SourcePanel() {
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const nodes = usePipelineBuilderStore((s) => s.nodes);

  const sourceNode = nodes.find((n) => n.type === "source");
  const sourceSchema = pipeline?.sourceSchema;
  const sourceData = sourceNode?.data;
  const sourceSchemaId = sourceSchema?.id;

  const { data: previewData, isLoading: previewLoading } = usePreviewSourceData(
    organizationId,
    sourceSchemaId,
    10,
    !!sourceSchemaId,
  );
  const discoverSchema = useDiscoverSourceSchema(
    organizationId,
    sourceSchemaId,
  );

  const handleDiscover = async () => {
    try {
      await discoverSchema.mutateAsync();
      toast.success("Schema discovered", "Column information has been updated.");
    } catch (error) {
      toast.error(
        "Discovery failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const selectedStreams = (sourceData?.selected_streams as string[]) ?? [];
  const buildItem = (schema: string, table: string) => ({
    database: "default",
    schema,
    table,
    syncMode: sourceData?.replication_method ?? pipeline?.pipeline.syncMode ?? "full",
    columnCount: sourceSchema?.discoveredColumns?.length ?? 0,
    rowEstimate: sourceSchema?.estimatedRowCount ?? undefined,
  });

  const items =
    selectedStreams.length > 0
      ? selectedStreams.map((s) => {
          const parts = s.includes(".") ? s.split(".") : ["public", s];
          return buildItem(parts[0] ?? "public", parts[1] ?? s);
        })
      : sourceSchema?.sourceTable
        ? [
            buildItem(
              sourceSchema.sourceSchema ?? "public",
              sourceSchema.sourceTable,
            ),
          ]
        : [];

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          Source Configuration
          <Badge variant="outline">SOURCE</Badge>
        </SheetTitle>
        <SheetDescription>
          {sourceSchema?.name ?? "Configure source connection and tables"}
        </SheetDescription>
      </SheetHeader>
      <Tabs defaultValue="tables" className="flex-1">
        <TabsList>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="cdc">CDC Setup</TabsTrigger>
          <TabsTrigger value="preview">Schema Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="tables" className="mt-4">
          <IncomingDataTreeView items={items} />
          <Button className="mt-4" variant="outline">
            Refresh Tables
          </Button>
        </TabsContent>
        <TabsContent value="connection" className="mt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{sourceSchema?.sourceType ?? "postgres"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Connection</span>
              <span className="font-medium">{sourceSchema?.name ?? "—"}</span>
            </div>
          </div>
          <Button className="mt-4" variant="outline">
            Test Connection
          </Button>
        </TabsContent>
        <TabsContent value="cdc" className="mt-4">
          <p className="text-sm text-muted-foreground">
            CDC setup for PostgreSQL. Configure WAL level and replication slot.
          </p>
        </TabsContent>
        <TabsContent value="preview" className="mt-4">
          {!sourceSchemaId ? (
            <p className="text-sm text-muted-foreground py-6">
              Save the pipeline with a source connection to preview schema data.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDiscover}
                  disabled={discoverSchema.isPending}
                >
                  {discoverSchema.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Discover Schema
                </Button>
              </div>
              {previewLoading ? (
                <div className="flex items-center justify-center py-12 border rounded-lg">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : previewData?.rows && previewData.rows.length > 0 ? (
                <div className="border rounded-lg overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {previewData.columns?.map((col) => (
                          <th
                            key={col.name}
                            className="px-3 py-2 text-left font-medium border-b"
                          >
                            <div className="flex flex-col">
                              <span>{col.name}</span>
                              <span className="text-xs text-muted-foreground font-normal">
                                {col.type}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.map((row, i) => {
                        const rowKey = previewData.columns?.[0]
                          ? `${String((row as Record<string, unknown>)[previewData.columns[0].name] ?? "")}-${i}`
                          : `row-${i}`;
                        return (
                          <tr
                            key={rowKey}
                            className="border-b last:border-0 hover:bg-muted/30"
                          >
                            {previewData.columns?.map((col) => (
                              <td
                                key={col.name}
                                className="px-3 py-2 truncate max-w-[200px]"
                              >
                                {String(
                                  (row as Record<string, unknown>)[col.name] ?? "-",
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No preview data available
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click &quot;Discover Schema&quot; to fetch schema information
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <SheetFooter>
        <Button>Save Changes</Button>
      </SheetFooter>
    </>
  );
}
