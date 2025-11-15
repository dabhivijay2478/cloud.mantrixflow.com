"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";

interface DashboardDndProviderProps {
  children: React.ReactNode;
}

export function DashboardDndProvider({
  children,
}: DashboardDndProviderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    // Store drag data and drop position for canvas to use
    if (active.data.current) {
      (window as any).__lastDragData = active.data.current;
    }
    
    // Store delta for position calculation
    if (delta) {
      (window as any).__lastDelta = delta;
    }
    
    // Store over target
    (window as any).__lastOver = over;
    
    if (over?.id === "canvas-drop-zone") {
      const canvasElement = document.getElementById("canvas-drop-zone");
      if (canvasElement) {
        const canvasRect = canvasElement.getBoundingClientRect();
        const mouseEvent = event.activatorEvent as MouseEvent | undefined;
        
        if (mouseEvent) {
          (window as any).__lastDropX = mouseEvent.clientX - canvasRect.left;
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

