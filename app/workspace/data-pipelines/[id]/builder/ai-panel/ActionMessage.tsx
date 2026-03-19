"use client";

import { Check, X, Zap } from "lucide-react";
import type { PipelineAction } from "./useAIChatPanel";
import { describeAction } from "./useAIChatPanel";
import { cn } from "@/lib/utils";

interface ActionMessageProps {
  action: PipelineAction;
  branches: { id: string; label: string }[];
  messageId: string;
  isApplied: boolean;
  isDismissed: boolean;
  onApply: () => void;
  onDismiss: () => void;
}

export function ActionMessage({
  action,
  branches,
  messageId,
  isApplied,
  isDismissed,
  onApply,
  onDismiss,
}: ActionMessageProps) {
  if (isDismissed) return null;

  const description = describeAction(action, branches);

  return (
    <div className="mt-2 rounded-lg border border-zinc-700/60 bg-zinc-900 p-3 space-y-2.5">
      <div className="flex items-start gap-2">
        <Zap className="h-3.5 w-3.5 text-teal-400 mt-0.5 shrink-0" />
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">
            Proposed change
          </div>
          <div className="text-xs text-zinc-200">{description}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isApplied ? (
          <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
            <Check className="h-3.5 w-3.5" />
            Applied
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={onApply}
              className="flex items-center gap-1.5 rounded-md bg-teal-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-teal-500 transition-colors"
            >
              <Check className="h-3 w-3" />
              Apply to pipeline
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="h-3 w-3" />
              Dismiss
            </button>
          </>
        )}
      </div>
    </div>
  );
}
