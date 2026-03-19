"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  applyNodeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { usePipelineBuilderStore } from "../store/pipelineStore";
import { SourceNode } from "./nodes/SourceNode";
import { TransformNode } from "./nodes/TransformNode";
import { DestinationNode } from "./nodes/DestinationNode";
import { DataEdge } from "./edges/DataEdge";
import { NodePalette } from "./NodePalette";

const nodeTypes = {
  source: SourceNode,
  transform: TransformNode,
  destination: DestinationNode,
};

const edgeTypes = {
  dataEdge: DataEdge,
};

function pipelineNodeToFlowNode(
  n: { id: string; type: string; data: Record<string, unknown>; position?: { x: number; y: number }; branch_id?: string },
): Node {
  return {
    id: n.id,
    type: n.type as "source" | "transform" | "destination",
    position: n.position ?? { x: 0, y: 0 },
    data: { ...n.data, branch_id: n.branch_id },
  };
}

function pipelineEdgeToFlowEdge(
  e: { id: string; source: string; target: string; type: string; sourceHandle?: string },
): Edge {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type || "dataEdge",
    sourceHandle: e.sourceHandle,
  };
}

export function CanvasView() {
  const nodes = usePipelineBuilderStore((s) => s.nodes);
  const edges = usePipelineBuilderStore((s) => s.edges);
  const updateNode = usePipelineBuilderStore((s) => s.updateNode);
  const setHasUnsavedChanges = usePipelineBuilderStore((s) => s.setHasUnsavedChanges);

  const flowNodes = useMemo(
    () => nodes.map((n) => pipelineNodeToFlowNode(n)),
    [nodes],
  );
  const flowEdges = useMemo(
    () => edges.map((e) => pipelineEdgeToFlowEdge(e)),
    [edges],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        if (
          change.type === "position" &&
          change.dragging === false &&
          change.position
        ) {
          updateNode(change.id, { position: change.position });
          setHasUnsavedChanges(true);
        }
      }
    },
    [updateNode, setHasUnsavedChanges],
  );

  const handleEdgesChange = useCallback((_changes: EdgeChange[]) => {
    // Store is source of truth; we don't add/remove edges from RF
  }, []);

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const source = "source" in connection ? connection.source : null;
      const target = "target" in connection ? connection.target : null;
      if (!source || !target) return false;
      const sourceNode = nodes.find((n) => n.id === source);
      const targetNode = nodes.find((n) => n.id === target);
      if (!sourceNode || !targetNode) return false;
      if (sourceNode.type === "source" && targetNode.type === "transform")
        return true;
      if (sourceNode.type === "transform" && targetNode.type === "destination")
        return true;
      return false;
    },
    [nodes],
  );

  return (
    <div className="h-[500px] w-full rounded-lg border">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        isValidConnection={isValidConnection}
        fitView
        className="bg-muted/20"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap />
        <Panel position="top-left">
          <NodePalette />
        </Panel>
      </ReactFlow>
    </div>
  );
}
