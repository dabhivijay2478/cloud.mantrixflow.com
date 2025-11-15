"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type * as React from "react";

interface DashboardDndProviderProps {
  children: React.ReactNode;
}

export function DashboardDndProvider({ children }: DashboardDndProviderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;

    // Store drag data and drop position for canvas to use
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
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
}
