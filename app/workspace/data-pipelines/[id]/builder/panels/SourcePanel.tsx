"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { IncomingDataTreeView } from "@/components/data-pipelines";
import { usePipelineBuilderStore } from "../store/pipelineStore";

export function SourcePanel() {
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const nodes = usePipelineBuilderStore((s) => s.nodes);

  const sourceNode = nodes.find((n) => n.type === "source");
  const sourceSchema = pipeline?.sourceSchema;
  const sourceData = sourceNode?.data;

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
      </Tabs>
      <SheetFooter>
        <Button>Save Changes</Button>
      </SheetFooter>
    </>
  );
}
