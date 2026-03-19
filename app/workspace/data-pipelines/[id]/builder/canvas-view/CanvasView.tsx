"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
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
import { FilterNode } from "./nodes/FilterNode";
import { JoinNode } from "./nodes/JoinNode";
import { DataEdge } from "./edges/DataEdge";
import { NodePalette } from "./NodePalette";
import { BranchGroupNode } from "./BranchGroup";

const nodeTypes = {
  source: SourceNode,
  transform: TransformNode,
  destination: DestinationNode,
  filter: FilterNode,
  join: JoinNode,
  branchGroup: BranchGroupNode,
};

const edgeTypes = {
  dataEdge: DataEdge,
};

function pipelineNodeToFlowNode(
  n: { id: string; type: string; data: Record<string, unknown>; position?: { x: number; y: number }; branch_id?: string },
): Node {
  return {
    id: n.id,
    type: n.type as "source" | "transform" | "destination" | "filter" | "join" | "branchGroup",
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

function CanvasViewInner() {
  const { screenToFlowPosition } = useReactFlow();
  const nodes = usePipelineBuilderStore((s) => s.nodes);
  const edges = usePipelineBuilderStore((s) => s.edges);
  const branches = usePipelineBuilderStore((s) => s.branches);
  const updateNode = usePipelineBuilderStore((s) => s.updateNode);
  const addFilterNode = usePipelineBuilderStore((s) => s.addFilterNode);
  const addJoinNode = usePipelineBuilderStore((s) => s.addJoinNode);
  const setHasUnsavedChanges = usePipelineBuilderStore((s) => s.setHasUnsavedChanges);

  const flowNodes = useMemo(() => {
    const regular = nodes.map((n) => pipelineNodeToFlowNode(n));
    const branchGroups: Node[] = branches.map((branch) => {
      const t = nodes.find((n) => n.id === branch.transform_node_id);
      const d = nodes.find((n) => n.id === branch.destination_node_id);
      if (!t?.position || !d?.position) return null;
      const padding = 20;
      const minX = Math.min(t.position.x, d.position.x) - padding;
      const maxX = Math.max(t.position.x, d.position.x) + 280;
      const minY = Math.min(t.position.y, d.position.y) - padding;
      const maxY = Math.max(t.position.y, d.position.y) + 120;
      return {
        id: `branch-group-${branch.id}`,
        type: "branchGroup",
        position: { x: minX, y: minY },
        data: {
          branch_id: branch.id,
          width: maxX - minX,
          height: maxY - minY,
        },
        draggable: false,
        selectable: false,
      };
    }).filter(Boolean) as Node[];
    return [...branchGroups, ...regular];
  }, [nodes, branches]);
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
      // source → transform, source → filter
      if (sourceNode.type === "source" && (targetNode.type === "transform" || targetNode.type === "filter"))
        return true;
      // filter → transform
      if (sourceNode.type === "filter" && targetNode.type === "transform")
        return true;
      // transform → destination
      if (sourceNode.type === "transform" && targetNode.type === "destination")
        return true;
      // Join: any output → join left/right; join output → transform or destination
      if (sourceNode.type === "source" && targetNode.type === "join") return true;
      if (sourceNode.type === "join" && (targetNode.type === "transform" || targetNode.type === "destination"))
        return true;
      return false;
    },
    [nodes],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      if (type === "filter" && branches[0]) {
        addFilterNode(branches[0].id, position);
      } else if (type === "join") {
        addJoinNode(position);
      }
    },
    [screenToFlowPosition, addFilterNode, addJoinNode, branches],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

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
        onDrop={onDrop}
        onDragOver={onDragOver}
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

export function CanvasView() {
  return (
    <ReactFlowProvider>
      <CanvasViewInner />
    </ReactFlowProvider>
  );
}

// CanvasViewInner must be inside ReactFlowProvider to use useReactFlow.
// It renders ReactFlow and passes onDrop which uses screenToFlowPosition.
