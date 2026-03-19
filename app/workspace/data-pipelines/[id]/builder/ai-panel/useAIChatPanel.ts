"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useCallback } from "react";
import { usePipelineBuilderStore } from "../store/pipelineStore";
import type { UIMessage } from "@ai-sdk/react";

export interface PipelineAction {
  type:
    | "select_streams"
    | "set_incremental"
    | "set_full_table"
    | "set_transform"
    | "set_emit_method"
    | "add_branch"
    | "delete_branch"
    | "rename_branch"
    | "set_schedule";
  // select_streams
  streams?: string[];
  // set_incremental / set_full_table
  stream?: string;
  replication_key?: string;
  // set_transform / set_emit_method / delete_branch / rename_branch
  branch_id?: string;
  script?: string;
  method?: string;
  label?: string;
  // set_schedule
  cron?: string;
  human?: string;
}

export function parseActionFromMessage(message: UIMessage): PipelineAction | null {
  const text = message.parts
    ?.filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("") ?? "";

  const match = text.match(/<action>([\s\S]*?)<\/action>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as PipelineAction;
  } catch {
    return null;
  }
}

export function stripActionTag(text: string): string {
  return text.replace(/<action>[\s\S]*?<\/action>/g, "").trim();
}

export function describeAction(action: PipelineAction, branches: { id: string; label: string }[]): string {
  const branchLabel = (id: string) =>
    branches.find((b) => b.id === id)?.label ?? id;

  switch (action.type) {
    case "select_streams":
      return `Select tables: ${action.streams?.join(", ") ?? ""}`;
    case "set_incremental":
      return `Set ${action.stream} to INCREMENTAL using ${action.replication_key}`;
    case "set_full_table":
      return `Set ${action.stream} to FULL TABLE sync`;
    case "set_transform":
      return `Update transform script for ${branchLabel(action.branch_id ?? "")}`;
    case "set_emit_method":
      return `Change write mode for ${branchLabel(action.branch_id ?? "")} to ${action.method}`;
    case "add_branch":
      return `Add new destination branch: ${action.label ?? "New Destination"}`;
    case "delete_branch":
      return `Remove branch: ${branchLabel(action.branch_id ?? "")}`;
    case "rename_branch":
      return `Rename branch to: ${action.label}`;
    case "set_schedule":
      return `Set schedule to: ${action.human ?? action.cron}`;
    default:
      return "Apply suggested change";
  }
}

function buildPipelineContext(store: ReturnType<typeof usePipelineBuilderStore.getState>) {
  const { pipeline, nodes, branches, runHistory } = store;
  const sourceNode = nodes.find((n) => n.type === "source");
  const lastRun = runHistory[0];

  return {
    pipeline_id: store.pipelineId ?? "",
    pipeline_name: pipeline?.pipeline.name ?? "Unnamed Pipeline",
    source: {
      connector_type: (sourceNode?.data.connector_type as string) ?? "postgres",
      connection_name: (sourceNode?.data.connection_name as string) ?? "",
      selected_streams: (sourceNode?.data.selected_streams as string[]) ?? [],
      stream_configs: (sourceNode?.data.stream_configs as Record<string, { replication_method: string; replication_key: string | null }>) ?? {},
    },
    branches: branches.map((branch) => {
      const transformNode = nodes.find(
        (n) => n.type === "transform" && n.branch_id === branch.id
      );
      const destNode = nodes.find(
        (n) => n.type === "destination" && n.branch_id === branch.id
      );
      return {
        id: branch.id,
        label: branch.label,
        transform_type: (transformNode?.data.transform_type as string) ?? "none",
        transform_script: (transformNode?.data.transform_script as string | null) ?? null,
        destination_connector_type: (destNode?.data.connector_type as string) ?? "postgres",
        destination_connection_name: (destNode?.data.connection_name as string) ?? "",
        emit_method: (destNode?.data.emit_method as string) ?? "append",
      };
    }),
    last_run_status: lastRun?.status ?? null,
    last_run_rows: lastRun?.rows_written ?? null,
  };
}

export function useAIChatPanel(pipelineId: string) {
  const store = usePipelineBuilderStore.getState;
  const branches = usePipelineBuilderStore((s) => s.branches);
  const nodes = usePipelineBuilderStore((s) => s.nodes);
  const updateNode = usePipelineBuilderStore((s) => s.updateNode);
  const addBranch = usePipelineBuilderStore((s) => s.addBranch);
  const deleteBranch = usePipelineBuilderStore((s) => s.deleteBranch);
  const updateBranchLabel = usePipelineBuilderStore((s) => s.updateBranchLabel);
  const updatePipelineMetadata = usePipelineBuilderStore((s) => s.updatePipelineMetadata);
  const setHasUnsavedChanges = usePipelineBuilderStore((s) => s.setHasUnsavedChanges);

  const [appliedMessageIds, setAppliedMessageIds] = useState<Set<string>>(new Set());
  const [dismissedMessageIds, setDismissedMessageIds] = useState<Set<string>>(new Set());

  const chat = useChat({
    api: `/api/pipelines/${pipelineId}/chat`,
    body: {
      pipelineContext: buildPipelineContext(store()),
    },
  });

  const applyAction = useCallback(
    (action: PipelineAction, messageId: string) => {
      const sourceNode = nodes.find((n) => n.type === "source");
      const sourceNodeId = sourceNode?.id ?? "source-1";

      switch (action.type) {
        case "select_streams": {
          if (action.streams) {
            updateNode(sourceNodeId, {
              data: { ...sourceNode?.data, selected_streams: action.streams },
            });
          }
          break;
        }
        case "set_incremental": {
          if (action.stream) {
            const existing = (sourceNode?.data.stream_configs as Record<string, unknown>) ?? {};
            updateNode(sourceNodeId, {
              data: {
                ...sourceNode?.data,
                stream_configs: {
                  ...existing,
                  [action.stream]: {
                    replication_method: "INCREMENTAL",
                    replication_key: action.replication_key ?? "updated_at",
                  },
                },
              },
            });
          }
          break;
        }
        case "set_full_table": {
          if (action.stream) {
            const existing = (sourceNode?.data.stream_configs as Record<string, unknown>) ?? {};
            updateNode(sourceNodeId, {
              data: {
                ...sourceNode?.data,
                stream_configs: {
                  ...existing,
                  [action.stream]: { replication_method: "FULL_TABLE", replication_key: null },
                },
              },
            });
          }
          break;
        }
        case "set_transform": {
          if (action.branch_id && action.script) {
            const transformNode = nodes.find(
              (n) => n.type === "transform" && n.branch_id === action.branch_id
            );
            if (transformNode) {
              updateNode(transformNode.id, {
                data: {
                  ...transformNode.data,
                  transform_script: action.script,
                  transform_type: "python_script",
                },
              });
            }
          }
          break;
        }
        case "set_emit_method": {
          if (action.branch_id && action.method) {
            const destNode = nodes.find(
              (n) => n.type === "destination" && n.branch_id === action.branch_id
            );
            if (destNode) {
              updateNode(destNode.id, {
                data: { ...destNode.data, emit_method: action.method },
              });
            }
          }
          break;
        }
        case "add_branch": {
          addBranch();
          break;
        }
        case "delete_branch": {
          if (action.branch_id) deleteBranch(action.branch_id);
          break;
        }
        case "rename_branch": {
          if (action.branch_id && action.label) {
            updateBranchLabel(action.branch_id, action.label);
          }
          break;
        }
        case "set_schedule": {
          if (action.cron) {
            updatePipelineMetadata({
              scheduleType: "cron",
              scheduleValue: action.cron,
            });
            setHasUnsavedChanges(true);
          }
          break;
        }
      }

      setAppliedMessageIds((prev) => new Set([...prev, messageId]));
      setHasUnsavedChanges(true);
    },
    [nodes, updateNode, addBranch, deleteBranch, updateBranchLabel, updatePipelineMetadata, setHasUnsavedChanges]
  );

  const dismissAction = useCallback((messageId: string) => {
    setDismissedMessageIds((prev) => new Set([...prev, messageId]));
  }, []);

  return {
    ...chat,
    branches,
    applyAction,
    dismissAction,
    appliedMessageIds,
    dismissedMessageIds,
  };
}
