"use client";

import { useEffect } from "react";
import { CanvasView } from "./canvas-view/CanvasView";
import { DrawerContainer } from "./shared/DrawerContainer";
import { AIChatPanel } from "./ai-panel/AIChatPanel";
import { usePipelineBuilderStore } from "./store/pipelineStore";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

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

  if (aiAssist.isOpen && pipelineId) {
    return (
      <div className="h-full w-full overflow-hidden">
        <ResizablePanelGroup
          orientation="horizontal"
          className="h-full w-full"
        >
          <ResizablePanel defaultSize="65%" minSize="40%" id="canvas">
            <div className="h-full overflow-hidden">
              <CanvasView />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="35%" minSize="25%" maxSize="50%" id="ai-panel">
            <AIChatPanel pipelineId={pipelineId} onClose={closeAIAssist} />
          </ResizablePanel>
        </ResizablePanelGroup>
        <DrawerContainer />
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="h-full overflow-hidden">
        <CanvasView />
      </div>
      <DrawerContainer />
    </div>
  );
}
