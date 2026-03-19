"use client";

import { useEffect } from "react";
import { CanvasView } from "./canvas-view/CanvasView";
import { DrawerContainer } from "./shared/DrawerContainer";
import { AIChatPanel } from "./ai-panel/AIChatPanel";
import { usePipelineBuilderStore } from "./store/pipelineStore";

export function PipelineBuilder() {
  const pipelineId = usePipelineBuilderStore((s) => s.pipelineId);
  const aiAssist = usePipelineBuilderStore((s) => s.aiAssist);
  const openAIAssist = usePipelineBuilderStore((s) => s.openAIAssist);
  const closeAIAssist = usePipelineBuilderStore((s) => s.closeAIAssist);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        aiAssist.isOpen ? closeAIAssist() : openAIAssist();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [aiAssist.isOpen, openAIAssist, closeAIAssist]);

  return (
    <div className="h-full w-full flex flex-row overflow-hidden">
      {/* Main canvas — shrinks when AI panel opens */}
      <div className="flex-1 overflow-hidden min-w-0">
        <CanvasView />
      </div>

      {/* AI Chat Panel — right side, not a drawer */}
      {aiAssist.isOpen && pipelineId && (
        <AIChatPanel
          pipelineId={pipelineId}
          onClose={closeAIAssist}
        />
      )}

      <DrawerContainer />
    </div>
  );
}
