"use client";

import { useCallback, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { usePipelineBuilderStore } from "../store/pipelineStore";

const DEFAULT_SCRIPT = `def transform(record):
    return record
`;

interface TransformPanelProps {
  branchId: string | null;
  nodeId: string | null;
}

export function TransformPanel({ branchId, nodeId }: TransformPanelProps) {
  const branches = usePipelineBuilderStore((s) => s.branches);
  const nodes = usePipelineBuilderStore((s) => s.nodes);
  const updateNode = usePipelineBuilderStore((s) => s.updateNode);

  const branch = branches.find((b) => b.id === branchId);
  const node = nodes.find((n) => n.id === nodeId);
  const data = node?.data ?? {};

  const [script, setScript] = useState(
    (data.transform_script as string) || DEFAULT_SCRIPT,
  );
  const [onError, setOnError] = useState(
    (data.on_transform_error as string) || "fail",
  );

  useEffect(() => {
    const d = node?.data ?? {};
    setScript((d.transform_script as string) || DEFAULT_SCRIPT);
    setOnError((d.on_transform_error as string) || "fail");
  }, [nodeId, node?.data]);

  const handleSave = useCallback(() => {
    if (!nodeId) return;
    updateNode(nodeId, {
      data: {
        ...data,
        transform_type: script.trim() ? "python_script" : "none",
        transform_script: script.trim() || null,
        on_transform_error: onError,
      },
    });
  }, [nodeId, script, onError, data, updateNode]);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          Transform
          <Badge variant="outline">TRANSFORM</Badge>
        </SheetTitle>
        <SheetDescription>
          {branch ? `Branch: ${branch.label}` : "Configure transform script"}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-5">
        <div className="h-[300px] min-h-[200px] overflow-hidden rounded-lg border">
          <Editor
            height="100%"
            defaultLanguage="python"
            value={script}
            onChange={(v) => setScript(v ?? "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>On Error</Label>
          <RadioGroup
            value={onError}
            onValueChange={setOnError}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fail" id="fail" />
              <Label htmlFor="fail" className="font-normal">
                Stop run on error
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="skip" id="skip" />
              <Label htmlFor="skip" className="font-normal">
                Skip record and continue
              </Label>
            </div>
          </RadioGroup>
        </div>
        <Button variant="outline">Preview with sample data</Button>
      </div>
      <SheetFooter>
        <Button onClick={handleSave}>Save Script</Button>
      </SheetFooter>
    </>
  );
}
