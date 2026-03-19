"use client";

import { create } from "zustand";
import { DataPipelinesService } from "@/lib/api/services/data-pipelines.service";
import type {
  PipelineWithSchemas,
  PipelineGraph,
  PipelineGraphNode,
  PipelineGraphEdge,
  PipelineGraphBranch,
  ScheduleType,
} from "@/lib/api/types/data-pipelines";

const BRANCH_COLORS = [
  "blue-500",
  "violet-500",
  "amber-500",
  "rose-500",
  "emerald-500",
  "sky-500",
  "orange-500",
] as const;

export type DrawerType =
  | "source"
  | "transform"
  | "destination"
  | "run_status"
  | "run_details"
  | "schedule"
  | "settings"
  | null;

export interface DrawerState {
  isOpen: boolean;
  type: DrawerType;
  nodeId: string | null;
  branchId: string | null;
  runId: string | null;
  hasUnsavedChanges: boolean;
}

interface PipelineBuilderState {
  pipelineId: string | null;
  pipeline: PipelineWithSchemas | null;
  nodes: PipelineGraphNode[];
  edges: PipelineGraphEdge[];
  branches: PipelineGraphBranch[];
  viewMode: "card" | "canvas";
  hasUnsavedChanges: boolean;
  drawerState: DrawerState;
  // Actions
  loadPipeline: (data: PipelineWithSchemas) => void;
  updateNode: (nodeId: string, changes: Partial<PipelineGraphNode>) => void;
  addBranch: () => void;
  deleteBranch: (branchId: string) => void;
  updateBranchLabel: (branchId: string, label: string) => void;
  openDrawer: (
    type: DrawerType,
    nodeId?: string | null,
    branchId?: string | null,
    runId?: string | null,
  ) => void;
  closeDrawer: () => void;
  setDrawerUnsavedChanges: (hasChanges: boolean) => void;
  savePipeline: () => Promise<void>;
  updatePipelineMetadata: (updates: {
    scheduleType?: ScheduleType;
    scheduleValue?: string;
    scheduleTimezone?: string;
    name?: string;
    description?: string;
  }) => Promise<void>;
  setViewMode: (mode: "card" | "canvas") => void;
  setHasUnsavedChanges: (value: boolean) => void;
  getBranchColor: (branchIndex: number) => string;
  reset: () => void;
}

const initialDrawerState: DrawerState = {
  isOpen: false,
  type: null,
  nodeId: null,
  branchId: null,
  runId: null,
  hasUnsavedChanges: false,
};

function buildGraphFromLegacyPipeline(
  pipeline: PipelineWithSchemas,
): { nodes: PipelineGraphNode[]; edges: PipelineGraphEdge[]; branches: PipelineGraphBranch[] } {
  const { pipeline: p, sourceSchema, destinationSchema } = pipeline;
  const baseId = `legacy_${Date.now()}`;
  const sourceId = "source-1";
  const transformId = "transform-1";
  const destinationId = "destination-1";
  const branchId = "branch-1";

  const sourceNode: PipelineGraphNode = {
    id: sourceId,
    type: "source",
    data: {
      connection_id: sourceSchema.dataSourceId ?? undefined,
      connector_type: sourceSchema.sourceType ?? "postgres",
      selected_streams: sourceSchema.sourceTable
        ? [`${sourceSchema.sourceSchema ?? "public"}.${sourceSchema.sourceTable}`]
        : [],
      stream_configs: {},
      replication_method: p.syncMode ?? "full",
    },
    position: { x: 100, y: 300 },
  };

  const transformNode: PipelineGraphNode = {
    id: transformId,
    type: "transform",
    branch_id: branchId,
    data: {
      transform_type: destinationSchema.transformScript ? "python_script" : "none",
      transform_script: destinationSchema.transformScript ?? null,
      on_transform_error: "fail",
    },
    position: { x: 400, y: 300 },
  };

  const destinationNode: PipelineGraphNode = {
    id: destinationId,
    type: "destination",
    branch_id: branchId,
    data: {
      connection_id: destinationSchema.dataSourceId,
      connector_type: "postgres",
      dest_schema: destinationSchema.destinationSchema ?? "public",
      emit_method: destinationSchema.writeMode ?? "append",
    },
    position: { x: 700, y: 300 },
  };

  const nodes = [sourceNode, transformNode, destinationNode];
  const edges: PipelineGraphEdge[] = [
    {
      id: "e1",
      source: sourceId,
      target: transformId,
      type: "dataEdge",
      sourceHandle: branchId,
    },
    { id: "e2", source: transformId, target: destinationId, type: "dataEdge" },
  ];
  const branches: PipelineGraphBranch[] = [
    {
      id: branchId,
      label: destinationSchema.name ?? "Branch 1",
      transform_node_id: transformId,
      destination_node_id: destinationId,
    },
  ];

  return { nodes, edges, branches };
}

export const usePipelineBuilderStore = create<PipelineBuilderState>((set, get) => ({
  pipelineId: null,
  pipeline: null,
  nodes: [],
  edges: [],
  branches: [],
  viewMode: "card",
  hasUnsavedChanges: false,
  drawerState: initialDrawerState,

  loadPipeline: (data: PipelineWithSchemas) => {
    const graph = data.pipeline.pipelineGraph;
    let nodes: PipelineGraphNode[];
    let edges: PipelineGraphEdge[];
    let branches: PipelineGraphBranch[];

    if (graph?.nodes?.length && graph?.edges?.length && graph?.branches?.length) {
      nodes = graph.nodes;
      edges = graph.edges;
      branches = graph.branches;
    } else {
      const built = buildGraphFromLegacyPipeline(data);
      nodes = built.nodes;
      edges = built.edges;
      branches = built.branches;
    }

    const viewMode =
      (data.pipeline.builderViewMode as "card" | "canvas") ?? "card";

    set({
      pipelineId: data.pipeline.id,
      pipeline: data,
      nodes,
      edges,
      branches,
      viewMode,
      hasUnsavedChanges: false,
      drawerState: initialDrawerState,
    });
  },

  updateNode: (nodeId: string, changes: Partial<PipelineGraphNode>) => {
    set((state) => {
      const nodes = state.nodes.map((n) =>
        n.id === nodeId ? { ...n, ...changes } : n,
      );
      return { nodes, hasUnsavedChanges: true };
    });
  },

  addBranch: () => {
    const { nodes, edges, branches, pipelineId } = get();
    const sourceNode = nodes.find((n) => n.type === "source");
    if (!sourceNode) return;

    const branchIndex = branches.length;
    const branchId = `branch-${Date.now()}`;
    const transformId = `transform-${Date.now()}`;
    const destinationId = `destination-${Date.now()}`;

    const newTransform: PipelineGraphNode = {
      id: transformId,
      type: "transform",
      branch_id: branchId,
      data: {
        transform_type: "none",
        transform_script: null,
        on_transform_error: "fail",
      },
      position: { x: 400, y: 150 + branchIndex * 200 },
    };

    const newDestination: PipelineGraphNode = {
      id: destinationId,
      type: "destination",
      branch_id: branchId,
      data: {
        connection_id: undefined,
        connector_type: "postgres",
        dest_schema: "public",
        emit_method: "append",
      },
      position: { x: 700, y: 150 + branchIndex * 200 },
    };

    const newBranch: PipelineGraphBranch = {
      id: branchId,
      label: `Branch ${branchIndex + 1}`,
      transform_node_id: transformId,
      destination_node_id: destinationId,
    };

    set({
      nodes: [...nodes, newTransform, newDestination],
      edges: [
        ...edges,
        {
          id: `e-${Date.now()}-1`,
          source: sourceNode.id,
          target: transformId,
          type: "dataEdge",
          sourceHandle: branchId,
        },
        {
          id: `e-${Date.now()}-2`,
          source: transformId,
          target: destinationId,
          type: "dataEdge",
        },
      ],
      branches: [...branches, newBranch],
      hasUnsavedChanges: true,
      drawerState: {
        isOpen: true,
        type: "destination",
        nodeId: destinationId,
        branchId,
        runId: null,
        hasUnsavedChanges: false,
      },
    });
  },

  deleteBranch: (branchId: string) => {
    const { branches } = get();
    if (branches.length <= 1) return;

    const branch = branches.find((b) => b.id === branchId);
    if (!branch) return;

    set((state) => ({
      nodes: state.nodes.filter(
        (n) => n.id !== branch.transform_node_id && n.id !== branch.destination_node_id,
      ),
      edges: state.edges.filter(
        (e) =>
          e.source !== branch.transform_node_id &&
          e.target !== branch.transform_node_id &&
          e.source !== branch.destination_node_id &&
          e.target !== branch.destination_node_id,
      ),
      branches: state.branches.filter((b) => b.id !== branchId),
      hasUnsavedChanges: true,
      drawerState:
        state.drawerState.branchId === branchId
          ? initialDrawerState
          : state.drawerState,
    }));
  },

  updateBranchLabel: (branchId: string, label: string) => {
    set((state) => ({
      branches: state.branches.map((b) =>
        b.id === branchId ? { ...b, label } : b,
      ),
      hasUnsavedChanges: true,
    }));
  },

  openDrawer: (type, nodeId, branchId, runId) => {
    const { drawerState } = get();
    if (drawerState.hasUnsavedChanges) {
      // Caller should show confirmation before opening new drawer
      // For now we allow opening - UI can intercept
    }
    set({
      drawerState: {
        isOpen: true,
        type: type ?? null,
        nodeId: nodeId ?? null,
        branchId: branchId ?? null,
        runId: runId ?? null,
        hasUnsavedChanges: false,
      },
    });
  },

  closeDrawer: () => {
    set({
      drawerState: initialDrawerState,
    });
  },

  setDrawerUnsavedChanges: (hasChanges: boolean) => {
    set((state) => ({
      drawerState: { ...state.drawerState, hasUnsavedChanges: hasChanges },
    }));
  },

  savePipeline: async () => {
    const { pipelineId, pipeline, nodes, edges, branches, viewMode } = get();
    if (!pipelineId || !pipeline) return;

    const orgId = pipeline.pipeline.organizationId;
    const pipelineGraph: PipelineGraph = { nodes, edges, branches };
    await DataPipelinesService.updatePipeline(orgId, pipelineId, {
      pipelineGraph,
      builderViewMode: viewMode,
    });

    set({
      hasUnsavedChanges: false,
      pipeline: {
        ...pipeline,
        pipeline: {
          ...pipeline.pipeline,
          pipelineGraph,
          builderViewMode: viewMode,
        },
      },
    });
  },

  updatePipelineMetadata: async (updates) => {
    const { pipelineId, pipeline } = get();
    if (!pipelineId || !pipeline) return;

    const orgId = pipeline.pipeline.organizationId;
    await DataPipelinesService.updatePipeline(orgId, pipelineId, updates);

    set({
      pipeline: {
        ...pipeline,
        pipeline: {
          ...pipeline.pipeline,
          ...(updates as Partial<typeof pipeline.pipeline>),
        },
      },
    });
  },

  setViewMode: (mode: "card" | "canvas") => {
    set({ viewMode: mode, hasUnsavedChanges: true });
  },

  setHasUnsavedChanges: (value: boolean) => {
    set({ hasUnsavedChanges: value });
  },

  getBranchColor: (branchIndex: number) => {
    return BRANCH_COLORS[branchIndex % BRANCH_COLORS.length];
  },

  reset: () => {
    set({
      pipelineId: null,
      pipeline: null,
      nodes: [],
      edges: [],
      branches: [],
      viewMode: "card",
      hasUnsavedChanges: false,
      drawerState: initialDrawerState,
    });
  },
}));
