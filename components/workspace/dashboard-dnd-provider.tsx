"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type * as React from "react";
import type { WindowWithDragData } from "./dashboard-canvas";

interface DashboardDndProviderProps {
  children: React.ReactNode;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragStart?: (event: DragStartEvent) => void;
}

export function DashboardDndProvider({
  children,
  onDragEnd: customOnDragEnd,
  onDragStart: customOnDragStart,
}: DashboardDndProviderProps) {
  // Use MouseSensor and TouchSensor for better responsiveness
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3, // Require only 3px movement before drag starts (reduced from 8)
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150, // 150ms delay for touch to distinguish from scroll
      tolerance: 5, // 5px tolerance for touch
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {});

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const handleDragStart = (event: DragStartEvent) => {
    // Store active drag info for canvas to use
    if (event.active.data.current) {
      (window as WindowWithDragData).__lastDragData = event.active.data.current;
    }

    // Call custom handler if provided
    if (customOnDragStart) {
      customOnDragStart(event);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // Call custom handler first (important for sortable mode)
    if (customOnDragEnd) {
      customOnDragEnd(event);
    }

    const { active, over, delta } = event;
    const windowWithData = window as WindowWithDragData;

    // Store drag data and drop position for canvas to use (for free mode)
    if (active.data.current) {
      windowWithData.__lastDragData = active.data.current;
    }

    // Store delta for position calculation
    if (delta) {
      windowWithData.__lastDelta = delta;
    }

    // Store over target
    windowWithData.__lastOver = over;

    if (over?.id === "canvas-drop-zone") {
      const canvasElement = document.getElementById("canvas-drop-zone");
      if (canvasElement) {
        const canvasRect = canvasElement.getBoundingClientRect();
        const mouseEvent = event.activatorEvent as MouseEvent | undefined;

        if (mouseEvent) {
          windowWithData.__lastDropX = mouseEvent.clientX - canvasRect.left;
          windowWithData.__lastDropY = mouseEvent.clientY - canvasRect.top;
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
}
