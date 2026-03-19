"use client";

import { CanvasView } from "./canvas-view/CanvasView";
import { DrawerContainer } from "./shared/DrawerContainer";

export function PipelineBuilder() {
  return (
    <div className="h-full w-full">
      <CanvasView />
      <DrawerContainer />
    </div>
  );
}
