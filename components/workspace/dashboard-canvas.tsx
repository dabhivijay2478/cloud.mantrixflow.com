"use client";

import * as React from "react";
import { useState, useCallback, useMemo, useEffect } from "react";
import "react-resizable/css/styles.css";
import {
  DragOverlay,
  useDroppable,
  useDndContext,
} from "@dnd-kit/core";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";
import type { DashboardComponent } from "@/lib/stores/workspace-store";
import { DashboardItem } from "./dashboard-item";
import { ComponentRenderer } from "./component-renderer";

const GRID_SIZE = 20; // Grid cell size in pixels
const GRID_COLS = 24; // Number of grid columns
const GRID_ROWS = 40; // Number of grid rows

interface DashboardCanvasProps {
  components: DashboardComponent[];
  onComponentsChange: (components: DashboardComponent[]) => void;
  onComponentUpdate: (id: string, updates: Partial<DashboardComponent>) => void;
  onComponentDelete: (id: string) => void;
  className?: string;
}

export function DashboardCanvas({
  components,
  onComponentsChange,
  onComponentUpdate,
  onComponentDelete,
  className,
}: DashboardCanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedComponentType, setDraggedComponentType] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { active, over, delta } = useDndContext();
  const prevActiveRef = React.useRef(active);

  // Snap position to grid
  const snapToGrid = useCallback((x: number, y: number) => {
    return {
      x: Math.round(x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(y / GRID_SIZE) * GRID_SIZE,
    };
  }, []);

  // Convert pixel position to grid coordinates
  const pixelToGrid = useCallback((pixels: number) => {
    return Math.round(pixels / GRID_SIZE);
  }, []);

  // Listen to drag events from the parent DndContext
  useEffect(() => {
    if (active) {
      setActiveId(active.id as string);
      setIsDragging(true);

      const activeData = active.data.current;
      if (activeData?.componentType) {
        setDraggedComponentType(activeData.componentType);
      } else if (activeData?.type === "dashboard-item") {
        setDraggedComponentType(null);
      }
    } else {
      setActiveId(null);
      setDraggedComponentType(null);
      setIsDragging(false);
    }
  }, [active]);

  // Handle drag end when dropped on canvas
  useEffect(() => {
    // Detect when drag ends (active goes from non-null to null)
    const wasDragging = prevActiveRef.current !== null;
    const justEnded = wasDragging && active === null;
    
    prevActiveRef.current = active;

    if (justEnded && (window as any).__lastDragData) {
      const lastActiveData = (window as any).__lastDragData;
      const lastOver = (window as any).__lastOver;
      
      if (lastOver?.id === "canvas-drop-zone") {
        if (lastActiveData?.type === "palette" && lastActiveData?.componentType) {
          // Dropping from components panel
          const canvasElement = document.getElementById("canvas-drop-zone");
          if (!canvasElement) {
            setActiveId(null);
            setDraggedComponentType(null);
            return;
          }

          const canvasRect = canvasElement.getBoundingClientRect();
          const dropX = (window as any).__lastDropX || canvasRect.width / 2;
          const dropY = (window as any).__lastDropY || canvasRect.height / 2;

          const snapped = snapToGrid(dropX, dropY);
          const gridX = pixelToGrid(snapped.x);
          const gridY = pixelToGrid(snapped.y);

          const clampedX = Math.max(0, Math.min(gridX, GRID_COLS - 6));
          const clampedY = Math.max(0, Math.min(gridY, GRID_ROWS - 4));

          const newComponent: DashboardComponent = {
            id: nanoid(),
            type: lastActiveData.componentType,
            position: {
              x: clampedX,
              y: clampedY,
              w: 6,
              h: 4,
            },
            config: {},
            zIndex: components.length > 0 ? Math.max(...components.map((c) => c.zIndex || 0)) + 1 : 1,
          };

          onComponentsChange([...components, newComponent]);
        } else if (lastActiveData?.type === "dashboard-item" && lastActiveData?.component) {
          // Moving existing component
          const component = lastActiveData.component as DashboardComponent;
          const componentId = component.id;

          // Get the stored delta or calculate from drop position
          const storedDelta = (window as any).__lastDelta;
          const dropX = (window as any).__lastDropX;
          const dropY = (window as any).__lastDropY;

          if (component) {
            let newX: number;
            let newY: number;

            if (dropX !== undefined && dropY !== undefined) {
              // Use drop position
              newX = dropX;
              newY = dropY;
            } else if (storedDelta) {
              // Use delta
              newX = component.position.x * GRID_SIZE + storedDelta.x;
              newY = component.position.y * GRID_SIZE + storedDelta.y;
            } else {
              // Fallback to current position
              newX = component.position.x * GRID_SIZE;
              newY = component.position.y * GRID_SIZE;
            }

            const snapped = snapToGrid(newX, newY);
            const gridX = pixelToGrid(snapped.x);
            const gridY = pixelToGrid(snapped.y);

            const clampedX = Math.max(0, Math.min(gridX, GRID_COLS - component.position.w));
            const clampedY = Math.max(0, Math.min(gridY, GRID_ROWS - component.position.h));

            onComponentUpdate(componentId, {
              position: {
                ...component.position,
                x: clampedX,
                y: clampedY,
              },
            });
          }
        }

        setActiveId(null);
        setDraggedComponentType(null);
        delete (window as any).__lastDragData;
        delete (window as any).__lastOver;
        delete (window as any).__lastDelta;
        delete (window as any).__lastDropX;
        delete (window as any).__lastDropY;
      }
    }
  }, [active, activeId, delta, components, onComponentsChange, onComponentUpdate, snapToGrid, pixelToGrid]);

  // Store drag data before it's cleared
  useEffect(() => {
    if (active) {
      (window as any).__lastDragData = active.data.current;
    }
  }, [active]);

  const handleResize = useCallback(
    (id: string, newSize: { w: number; h: number }) => {
      onComponentUpdate(id, {
        position: {
          ...components.find((c) => c.id === id)?.position!,
          w: newSize.w,
          h: newSize.h,
        },
      });
    },
    [components, onComponentUpdate]
  );

  const handleLayerChange = useCallback(
    (id: string, direction: "front" | "back") => {
      const component = components.find((c) => c.id === id);
      if (!component) return;

      const currentZIndex = component.zIndex || 0;
      let newZIndex: number;

      if (direction === "front") {
        const maxZIndex = Math.max(...components.map((c) => c.zIndex || 0));
        newZIndex = maxZIndex + 1;
      } else {
        const minZIndex = Math.min(...components.map((c) => c.zIndex || 0));
        newZIndex = Math.max(0, minZIndex - 1);
      }

      onComponentUpdate(id, { zIndex: newZIndex });
    },
    [components, onComponentUpdate]
  );

  // Grid background pattern
  const gridPattern = useMemo(() => {
    const pattern = [];
    for (let i = 0; i <= GRID_COLS; i++) {
      pattern.push(
        <div
          key={`col-${i}`}
          className="absolute border-l border-border/30"
          style={{ left: `${i * GRID_SIZE}px`, width: "1px", height: "100%" }}
        />
      );
    }
    for (let i = 0; i <= GRID_ROWS; i++) {
      pattern.push(
        <div
          key={`row-${i}`}
          className="absolute border-t border-border/30"
          style={{ top: `${i * GRID_SIZE}px`, width: "100%", height: "1px" }}
        />
      );
    }
    return pattern;
  }, []);

  return (
    <>
      <CanvasDropZone>
        <div
          className={cn(
            "relative w-full h-full min-h-[600px] bg-background",
            isDragging && "bg-muted/50",
            className
          )}
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border) / 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          }}
        >
          {/* Grid overlay - visible when dragging */}
          {isDragging && (
            <div className="absolute inset-0 pointer-events-none opacity-30">
              {gridPattern}
            </div>
          )}

          {/* Components */}
          {components.map((component) => (
            <DashboardItem
              key={component.id}
              component={component}
              gridSize={GRID_SIZE}
              onResize={handleResize}
              onDelete={onComponentDelete}
              onLayerChange={handleLayerChange}
              onUpdate={onComponentUpdate}
            >
              <ComponentRenderer component={component} />
            </DashboardItem>
          ))}

          {/* Empty state */}
          {components.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-foreground">
                  Your dashboard is empty
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Drag components from the left panel to start building your dashboard
                </p>
              </div>
            </div>
          )}
        </div>
      </CanvasDropZone>
    </>
  );
}

// Export wrapper that uses parent DndContext
export function DashboardCanvasWithHandlers(props: DashboardCanvasProps) {
  return <DashboardCanvas {...props} />;
}

function CanvasDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-drop-zone",
  });

  return (
    <div
      id="canvas-drop-zone"
      ref={setNodeRef}
      className={cn(
        "relative w-full h-full min-h-[600px]",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {children}
    </div>
  );
}
