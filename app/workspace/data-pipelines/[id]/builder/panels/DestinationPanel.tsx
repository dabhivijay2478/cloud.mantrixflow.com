"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { WriteMode } from "@/lib/api/types/data-pipelines";
import { usePipelineBuilderStore } from "../store/pipelineStore";

const WRITE_MODES: { value: WriteMode; label: string; desc: string }[] = [
  { value: "append", label: "Append", desc: "Add new rows only" },
  { value: "upsert", label: "Merge", desc: "Update existing, insert new" },
  { value: "replace", label: "Overwrite", desc: "Replace table contents" },
];

interface DestinationPanelProps {
  branchId: string | null;
  nodeId: string | null;
}

export function DestinationPanel({ branchId, nodeId }: DestinationPanelProps) {
  const branches = usePipelineBuilderStore((s) => s.branches);
  const nodes = usePipelineBuilderStore((s) => s.nodes);
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const updateNode = usePipelineBuilderStore((s) => s.updateNode);
  const deleteBranch = usePipelineBuilderStore((s) => s.deleteBranch);

  const branch = branches.find((b) => b.id === branchId);
  const node = nodes.find((n) => n.id === nodeId);
  const data = node?.data ?? {};
  const destSchema = pipeline?.destinationSchema;

  const [schema, setSchema] = useState(
    (data.dest_schema as string) ?? destSchema?.destinationSchema ?? "public",
  );
  const [table, setTable] = useState(
    (data.dest_table as string) ?? destSchema?.destinationTable ?? "",
  );
  const [writeMode, setWriteMode] = useState<WriteMode>(
    (data.emit_method as WriteMode) ?? destSchema?.writeMode ?? "append",
  );

  useEffect(() => {
    const d = node?.data ?? {};
    setSchema(
      (d.dest_schema as string) ?? destSchema?.destinationSchema ?? "public",
    );
    setTable(
      (d.dest_table as string) ?? destSchema?.destinationTable ?? "",
    );
    setWriteMode(
      (d.emit_method as WriteMode) ?? destSchema?.writeMode ?? "append",
    );
  }, [nodeId, node?.data, destSchema]);

  const handleSave = useCallback(() => {
    if (!nodeId) return;
    updateNode(nodeId, {
      data: {
        ...data,
        dest_schema: schema || "public",
        dest_table: table,
        emit_method: writeMode,
      },
    });
  }, [nodeId, schema, table, writeMode, data, updateNode]);

  const handleDeleteBranch = useCallback(() => {
    if (branchId && branches.length > 1) {
      deleteBranch(branchId);
    }
  }, [branchId, branches.length, deleteBranch]);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          Destination
          <Badge variant="outline">DESTINATION</Badge>
        </SheetTitle>
        <SheetDescription>
          {branch ? `Branch: ${branch.label}` : "Configure destination"}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-4 py-4">
        <div className="space-y-2">
          <Label>Connection</Label>
          <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            {destSchema?.name ?? "Use pipeline destination connection"}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dest-schema">Schema</Label>
            <Input
              id="dest-schema"
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              placeholder="public"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dest-table">Table</Label>
            <Input
              id="dest-table"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              placeholder="my_table"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Write Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            {WRITE_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setWriteMode(m.value)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  writeMode === m.value
                    ? "border-primary bg-primary/10"
                    : "hover:bg-muted/50",
                )}
              >
                <div className="font-medium">{m.label}</div>
                <div className="text-xs text-muted-foreground">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <SheetFooter>
        <Button onClick={handleSave}>Save</Button>
        {branches.length > 1 && branchId && (
          <Button variant="destructive" onClick={handleDeleteBranch}>
            Remove this branch
          </Button>
        )}
      </SheetFooter>
    </>
  );
}
