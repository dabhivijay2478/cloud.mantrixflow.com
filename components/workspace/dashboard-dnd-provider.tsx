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
  // Use MouseSensor and TouchSensor like in the examples for better responsiveness
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8, // Require 8px movement before drag starts
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200, // 200ms delay for touch to distinguish from scroll
      tolerance: 5, // 5px tolerance for touch
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {});

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const handleDragStart = (event: DragStartEvent) => {
    // Store active drag info for canvas to use
    if (event.active.data.current) {
      // biome-ignore lint/suspicious/noExplicitAny: Window extension for drag data
      (window as any).__lastDragData = event.active.data.current;
    }

    // Call custom handler if provided
    if (customOnDragStart) {
      customOnDragStart(event);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // If custom handler provided, call it first (for sortable mode)
    if (customOnDragEnd) {
      customOnDragEnd(event);
    }

    const { active, over, delta } = event;

    // Store drag data and drop position for canvas to use (for free mode)
    if (active.data.current) {
      // biome-ignore lint/suspicious/noExplicitAny: Window extension for drag data
      (window as any).__lastDragData = active.data.current;
    }

    // Store delta for position calculation
    if (delta) {
      // biome-ignore lint/suspicious/noExplicitAny: Window extension for drag delta
      (window as any).__lastDelta = delta;
    }

    // Store over target
    // biome-ignore lint/suspicious/noExplicitAny: Window extension for drag over
    (window as any).__lastOver = over;

    if (over?.id === "canvas-drop-zone") {
      const canvasElement = document.getElementById("canvas-drop-zone");
      if (canvasElement) {
        const canvasRect = canvasElement.getBoundingClientRect();
        const mouseEvent = event.activatorEvent as MouseEvent | undefined;

        if (mouseEvent) {
          // biome-ignore lint/suspicious/noExplicitAny: Window extension for drop coordinates
          (window as any).__lastDropX = mouseEvent.clientX - canvasRect.left;
          // biome-ignore lint/suspicious/noExplicitAny: Window extension for drop coordinates
          (window as any).__lastDropY = mouseEvent.clientY - canvasRect.top;
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
