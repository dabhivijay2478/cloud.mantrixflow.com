"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, X } from "lucide-react";
import type { NodeTypeFilter, NodeStateFilter } from "./CanvasToolbar";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  useReactFlow,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type Node,
  type Edge,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import { usePipelineBuilderStore } from "../store/pipelineStore";
import { RunStatusBanner } from "../shared/RunStatusBanner";
import { SourceNode } from "./nodes/SourceNode";
import { TransformNode } from "./nodes/TransformNode";
import { DestinationNode } from "./nodes/DestinationNode";
import { FilterNode } from "./nodes/FilterNode";
import { JoinNode } from "./nodes/JoinNode";
import { DataEdge } from "./edges/DataEdge";
import { BranchGroupNode } from "./BranchGroup";
import { CanvasToolbar } from "./CanvasToolbar";

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
  branches: { id: string }[],
): Edge {
  const branchIndex = e.sourceHandle
    ? branches.findIndex((b) => b.id === e.sourceHandle)
    : -1;
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type || "dataEdge",
    sourceHandle: e.sourceHandle,
    data: { branch_index: branchIndex >= 0 ? branchIndex : 0 },
  };
}

function CanvasViewInner() {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<NodeTypeFilter>("all");
  const [stateFilter, setStateFilter] = useState<NodeStateFilter>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      e.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const nodes = usePipelineBuilderStore((s) => s.nodes);
  const edges = usePipelineBuilderStore((s) => s.edges);
  const branches = usePipelineBuilderStore((s) => s.branches);
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const updateNode = usePipelineBuilderStore((s) => s.updateNode);
  const addFilterNode = usePipelineBuilderStore((s) => s.addFilterNode);
  const addJoinNode = usePipelineBuilderStore((s) => s.addJoinNode);
  const applyFanOutLayout = usePipelineBuilderStore((s) => s.applyFanOutLayout);
  const setHasUnsavedChanges = usePipelineBuilderStore((s) => s.setHasUnsavedChanges);
  const useMockData = usePipelineBuilderStore((s) => s.useMockData);
  const activeRunStore = usePipelineBuilderStore((s) => s.activeRun);
  const runHistory = usePipelineBuilderStore((s) => s.runHistory);
  const aiPanelOpen = usePipelineBuilderStore((s) => s.aiAssist.isOpen);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        if (h > 0) setCanvasHeight(h);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleLayout = useCallback(() => {
    applyFanOutLayout(canvasHeight);
    setTimeout(() => {
      fitView({ padding: 0.15, duration: 400 });
    }, 50);
  }, [applyFanOutLayout, canvasHeight, fitView]);

  useEffect(() => {
    const sourceNode = nodes.find((n) => n.type === "source");
    if (!sourceNode || branches.length === 0) return;
    const allZeroOrNull = nodes.every(
      (n) => !n.position || (n.position.x === 0 && n.position.y === 0),
    );
    if (allZeroOrNull) {
      applyFanOutLayout(canvasHeight);
    }
  }, [nodes.length, branches.length, canvasHeight, applyFanOutLayout]);

  const isNodeMatchingFilter = useCallback(
    (n: { id: string; type: string; data: Record<string, unknown>; branch_id?: string }) => {
      const q = searchQuery.trim().toLowerCase();
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      if (stateFilter === "running" && activeRunStore.status !== "running") return false;
      if (stateFilter === "listening" && activeRunStore.status === "running") return false;
      if (!q) return true;
      const connectionName = String(n.data.connection_name ?? n.data.connection_id ?? "").toLowerCase();
      const connectorType = String(n.data.connector_type ?? "").toLowerCase();
      const nodeType = n.type.toLowerCase();
      return connectionName.includes(q) || connectorType.includes(q) || nodeType.includes(q);
    },
    [searchQuery, typeFilter, stateFilter, activeRunStore.status],
  );

  const flowNodes = useMemo(() => {
    const hasFilter = searchQuery.trim() !== "" || typeFilter !== "all" || stateFilter !== "all";
    const regular = nodes.map((n) => {
      const node = pipelineNodeToFlowNode(n);
      if (hasFilter && !isNodeMatchingFilter(n)) {
        return { ...node, style: { opacity: 0.25, pointerEvents: "none" as const } };
      }
      return node;
    });
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
    () => edges.map((e) => pipelineEdgeToFlowEdge(e, branches)),
    [edges, branches],
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

  const lastRun = runHistory[0];
  const totalRowsFromStore =
    useMockData && activeRunStore.status === "running"
      ? activeRunStore.branchProgress.reduce((s, b) => s + b.rows_synced, 0)
      : 0;

  return (
    <div ref={containerRef} className="h-full w-full bg-zinc-950">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        isValidConnection={isValidConnection}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        colorMode="dark"
        className="bg-zinc-950"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="rgb(39 39 42)"
          bgColor="rgb(10 10 10)"
        />

        {/* Pipeline name + back — top-right */}
        <Panel position="top-right" style={{ margin: 6 }}>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/95 px-2.5 py-1.5 shadow-lg backdrop-blur-sm">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center rounded p-0.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              title="Back"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <div className="h-3.5 w-px bg-zinc-700" />
            <div>
              <div className="text-xs font-semibold text-zinc-100 leading-tight">
                {pipeline?.pipeline.name ?? "Pipeline"}
              </div>
              {pipeline?.pipeline.description && (
                <div className="text-[10px] text-zinc-400 mt-0.5 max-w-[200px] truncate leading-tight">
                  {pipeline.pipeline.description}
                </div>
              )}
            </div>
          </div>
        </Panel>

        {/* Toolbar — top-left */}
        <Panel position="top-left" style={{ margin: 6 }}>
          <CanvasToolbar />
        </Panel>

        {/* Search — top-center (narrower when AI panel open to avoid overlap) */}
        <Panel position="top-center" style={{ margin: 6 }}>
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3 w-3 text-zinc-500 pointer-events-none" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes (/)"
              className={cn(
                "h-7 pl-7 pr-7 rounded-lg border border-zinc-700 bg-zinc-900/95 text-zinc-200 placeholder:text-zinc-500 text-xs shadow-lg backdrop-blur-sm focus:outline-none focus:border-zinc-500 transition-all",
                aiPanelOpen ? "w-44 min-w-[140px]" : "w-72 min-w-[200px]"
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </Panel>

        {/* Run status — bottom-center */}
        {(activeRunStore.status === "running" ||
          activeRunStore.status === "success" ||
          activeRunStore.status === "failed") && (
          <Panel position="bottom-center">
            <div className="mb-12">
              <RunStatusBanner
                isRunning={activeRunStore.status === "running"}
                isSuccess={activeRunStore.status === "success"}
                isFailed={activeRunStore.status === "failed"}
                rowsProcessed={
                  activeRunStore.status === "running"
                    ? totalRowsFromStore
                    : lastRun && "rows_written" in lastRun
                      ? lastRun.rows_written
                      : 0
                }
                duration={
                  activeRunStore.status === "running"
                    ? `${Math.floor(activeRunStore.elapsedSeconds)}s elapsed`
                    : undefined
                }
              />
            </div>
          </Panel>
        )}

        <Controls />
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
