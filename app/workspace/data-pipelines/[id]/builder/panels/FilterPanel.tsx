"use client";

import { useCallback, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { usePipelineBuilderStore } from "../store/pipelineStore";

interface FilterPanelProps {
  branchId: string | null;
  nodeId: string | null;
}

export function FilterPanel({ branchId, nodeId }: FilterPanelProps) {
  const branches = usePipelineBuilderStore((s) => s.branches);
  const nodes = usePipelineBuilderStore((s) => s.nodes);
  const updateNode = usePipelineBuilderStore((s) => s.updateNode);

  const branch = branches.find((b) => b.id === branchId);
  const node = nodes.find((n) => n.id === nodeId);
  const data = node?.data ?? {};

  const [filterType, setFilterType] = useState<"python" | "sql">(
    ((data.filter_type as string) ?? "python") as "python" | "sql",
  );
  const [pythonExpr, setPythonExpr] = useState(
    (data.filter_expression as string) ?? "record.get('status') != 'deleted'",
  );
  const [sqlWhere, setSqlWhere] = useState(
    (data.sql_where as string) ?? "status != 'deleted'",
  );

  useEffect(() => {
    const d = node?.data ?? {};
    setFilterType(((d.filter_type as string) ?? "python") as "python" | "sql");
    setPythonExpr((d.filter_expression as string) ?? "record.get('status') != 'deleted'");
    setSqlWhere((d.sql_where as string) ?? "status != 'deleted'");
  }, [nodeId, node?.data]);

  const handleSave = useCallback(() => {
    if (!nodeId) return;
    updateNode(nodeId, {
      data: {
        ...data,
        filter_type: filterType,
        filter_expression: filterType === "python" ? pythonExpr : undefined,
        sql_where: filterType === "sql" ? sqlWhere : undefined,
      },
    });
  }, [nodeId, filterType, pythonExpr, sqlWhere, data, updateNode]);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          Filter
          <Badge variant="outline">FILTER</Badge>
        </SheetTitle>
        <SheetDescription>
          {branch ? `Branch: ${branch.label}` : "Configure filter expression"}
        </SheetDescription>
      </SheetHeader>
      <Tabs
        defaultValue={filterType}
        onValueChange={(v) => setFilterType(v as "python" | "sql")}
      >
        <TabsList>
          <TabsTrigger value="python">Python Expression</TabsTrigger>
          <TabsTrigger value="sql">SQL WHERE</TabsTrigger>
        </TabsList>
        <TabsContent value="python" className="mt-4">
          <Label className="text-muted-foreground text-xs">
            Return True to keep the record, False to drop it.
          </Label>
          <div className="mt-2 h-[120px] overflow-hidden rounded-lg border">
            <Editor
              height="100%"
              defaultLanguage="python"
              value={pythonExpr}
              onChange={(v) => setPythonExpr(v ?? "")}
              theme="vs-dark"
              options={{ minimap: { enabled: false }, lineNumbers: "off" }}
            />
          </div>
        </TabsContent>
        <TabsContent value="sql" className="mt-4">
          <Label className="text-muted-foreground text-xs">
            WHERE clause appended to source query.
          </Label>
          <textarea
            className="mt-2 w-full rounded-lg border bg-muted/30 p-3 font-mono text-sm"
            rows={4}
            value={sqlWhere}
            onChange={(e) => setSqlWhere(e.target.value)}
            placeholder="status != 'deleted' AND created_at > '2024-01-01'"
          />
        </TabsContent>
      </Tabs>
      <Button variant="outline" className="mt-4">
        Preview (5 rows)
      </Button>
      <SheetFooter>
        <Button onClick={handleSave}>Save</Button>
      </SheetFooter>
    </>
  );
}
