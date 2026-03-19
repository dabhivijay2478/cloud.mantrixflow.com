"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Database, GitBranch } from "lucide-react";
import { usePipelineBuilderStore } from "../store/pipelineStore";

interface PipelineContextBarProps {
  hasMessages: boolean;
}

export function PipelineContextBar({ hasMessages }: PipelineContextBarProps) {
  const [expanded, setExpanded] = useState(false);
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const nodes = usePipelineBuilderStore((s) => s.nodes);
  const branches = usePipelineBuilderStore((s) => s.branches);

  const sourceNode = nodes.find((n) => n.type === "source");
  const connectorType = (sourceNode?.data.connector_type as string) ?? "postgres";
  const selectedStreams = (sourceNode?.data.selected_streams as string[]) ?? [];
  const pipelineName = pipeline?.pipeline.name ?? "Pipeline";

  if (hasMessages && !expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 w-full text-left hover:bg-zinc-900/50 transition-colors"
      >
        <Database className="h-3 w-3 text-zinc-500 shrink-0" />
        <span className="text-xs text-zinc-400 truncate">
          {pipelineName} · {connectorType.toUpperCase()} → {branches.length} destination{branches.length !== 1 ? "s" : ""}
        </span>
        <ChevronRight className="h-3 w-3 text-zinc-600 ml-auto shrink-0" />
      </button>
    );
  }

  return (
    <div className="border-b border-zinc-800 bg-zinc-900/30">
      {hasMessages && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="flex items-center gap-1 w-full px-4 pt-2.5 pb-1 text-left"
        >
          <ChevronDown className="h-3 w-3 text-zinc-600" />
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Pipeline context</span>
        </button>
      )}
      <div className="px-4 py-2.5 space-y-1.5">
        <div className="flex items-center gap-2">
          <Database className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <span className="text-xs font-medium text-zinc-300 truncate">{pipelineName}</span>
        </div>
        <div className="pl-5 space-y-1">
          <div className="text-[11px] text-zinc-500">
            Source: <span className="text-zinc-400">{connectorType.toUpperCase()}</span>
            {selectedStreams.length > 0 && (
              <span className="text-zinc-500"> · {selectedStreams.length} table{selectedStreams.length !== 1 ? "s" : ""}</span>
            )}
          </div>
          {branches.map((b) => (
            <div key={b.id} className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <GitBranch className="h-2.5 w-2.5 shrink-0" />
              <span className="text-zinc-400 truncate">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
