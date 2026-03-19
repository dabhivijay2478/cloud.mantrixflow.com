"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { usePipelineBuilderStore } from "../store/pipelineStore";

const JOIN_TYPES = [
  { value: "inner", label: "Inner" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "full", label: "Full" },
] as const;

interface JoinPanelProps {
  nodeId: string | null;
}

export function JoinPanel({ nodeId }: JoinPanelProps) {
  const nodes = usePipelineBuilderStore((s) => s.nodes);
  const updateNode = usePipelineBuilderStore((s) => s.updateNode);

  const node = nodes.find((n) => n.id === nodeId);
  const data = node?.data ?? {};

  const [joinType, setJoinType] = useState<"inner" | "left" | "right" | "full">(
    ((data.join_type as string) ?? "inner") as "inner" | "left" | "right" | "full",
  );
  const [leftKey, setLeftKey] = useState((data.left_key as string) ?? "user_id");
  const [rightKey, setRightKey] = useState((data.right_key as string) ?? "id");

  useEffect(() => {
    const d = node?.data ?? {};
    setJoinType(((d.join_type as string) ?? "inner") as "inner" | "left" | "right" | "full");
    setLeftKey((d.left_key as string) ?? "user_id");
    setRightKey((d.right_key as string) ?? "id");
  }, [nodeId, node?.data]);

  const handleSave = useCallback(() => {
    if (!nodeId) return;
    updateNode(nodeId, {
      data: {
        ...data,
        join_type: joinType,
        left_key: leftKey,
        right_key: rightKey,
      },
    });
  }, [nodeId, joinType, leftKey, rightKey, data, updateNode]);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          Join Node
          <Badge variant="outline">JOIN</Badge>
        </SheetTitle>
        <SheetDescription>
          Configure join type and key columns
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-4 py-4">
        <div className="space-y-2">
          <Label>Join Type</Label>
          <Select
            value={joinType}
            onValueChange={(v) => setJoinType(v as "inner" | "left" | "right" | "full")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOIN_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Left Key</Label>
            <Select value={leftKey} onValueChange={setLeftKey}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user_id">user_id</SelectItem>
                <SelectItem value="id">id</SelectItem>
                <SelectItem value="created_at">created_at</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Right Key</Label>
            <Select value={rightKey} onValueChange={setRightKey}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">id</SelectItem>
                <SelectItem value="user_id">user_id</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button variant="outline">Preview (3 rows)</Button>
      </div>
      <SheetFooter>
        <Button onClick={handleSave}>Save</Button>
      </SheetFooter>
    </>
  );
}
