"use client";

import {
  DragOverlay,
  useDndContext,
  useDroppable,
} from "@dnd-kit/core";
import { nanoid } from "nanoid";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DashboardComponent } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import {
  canPlaceComponent,
  componentToRect,
  findBestPosition,
  getBoundingBox,
} from "@/lib/utils/dashboard-layout";
import { ComponentRenderer } from "./component-renderer";
import { DashboardItem } from "./dashboard-item";

const GRID_SIZE = 20;
const GRID_COLS = 12;
const GRID_ROWS = 40;

interface DashboardCanvasProps {
  components: DashboardComponent[];
  onComponentsChange: (components: DashboardComponent[]) => void;
  onComponentUpdate: (id: string, updates: Partial<DashboardComponent>) => void;
  onComponentDelete: (id: string) => void;
  onComponentSelect?: (id: string | null) => void;
  selectedComponentId?: string | null;
  className?: string;
}

export function DashboardCanvas({
  components,
  onComponentsChange,
  onComponentUpdate,
  onComponentDelete,
  onComponentSelect,
  selectedComponentId: externalSelectedComponentId,
  className,
}: DashboardCanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedComponentType, setDraggedComponentType] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);
  const [showOccupiedAreas, setShowOccupiedAreas] = useState(false);
  const [internalSelectedComponentId, setInternalSelectedComponentId] = useState<string | null>(null);

  const selectedComponentId =
    externalSelectedComponentId !== undefined
      ? externalSelectedComponentId
      : internalSelectedComponentId;

  const setSelectedComponentId = useCallback(
    (id: string | null) => {
      if (onComponentSelect) {
        onComponentSelect(id);
      } else {
        setInternalSelectedComponentId(id);
      }
    },
    [onComponentSelect],
  );

  const canvasRef = useRef<HTMLElement>(null);
  const { active } = useDndContext();
  
  // Store component positions at drag start
  const [componentPositions, setComponentPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Calculate canvas size
  useEffect(() => {
    const updateCanvasSize = () => {
      let scrollContainer = canvasRef.current?.parentElement?.parentElement;

      if (!scrollContainer || scrollContainer.clientWidth === 0) {
        scrollContainer = canvasRef.current?.parentElement?.parentElement?.parentElement;
      }

      if (scrollContainer) {
        const viewportWidth = Math.max(scrollContainer.clientWidth || 0, 320);
        const viewportHeight = Math.max(scrollContainer.clientHeight || 0, 400);

        const boundingBox = getBoundingBox(components, GRID_SIZE);
        const padding = 200;

        if (boundingBox && components.length > 0) {
          const bottomMostPoint = boundingBox.y + boundingBox.height;
          const contentHeight = bottomMostPoint + padding;
          const newHeight = Math.max(viewportHeight + 400, contentHeight);

          setCanvasSize({
            width: viewportWidth,
            height: newHeight,
          });
        } else {
          setCanvasSize({
            width: viewportWidth,
            height: Math.max(viewportHeight, 1000),
          });
        }
      }
    };

    updateCanvasSize();
    const timeoutId = setTimeout(updateCanvasSize, 100);
    const timeoutId2 = setTimeout(updateCanvasSize, 500);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateCanvasSize);
    });

    const scrollContainer = canvasRef.current?.parentElement?.parentElement;
    if (scrollContainer) {
      resizeObserver.observe(scrollContainer);
    }

    const mainPanel = document.getElementById("main-panel");
    if (mainPanel) {
      resizeObserver.observe(mainPanel);
    }

    window.addEventListener("resize", updateCanvasSize);

    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(updateCanvasSize);
    });

    if (mainPanel) {
      mutationObserver.observe(mainPanel, {
        attributes: true,
        attributeFilter: ["style", "class"],
        childList: false,
        subtree: false,
      });
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [components]);

  const snapToGrid = useCallback((x: number, y: number) => {
    return {
      x: Math.round(x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(y / GRID_SIZE) * GRID_SIZE,
    };
  }, []);

  const pixelToGrid = useCallback((pixels: number) => {
    return Math.round(pixels / GRID_SIZE);
  }, []);

  // Initialize component positions when components change
  useEffect(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    components.forEach((component) => {
      positions[component.id] = {
        x: component.position.x * GRID_SIZE,
        y: component.position.y * GRID_SIZE,
      };
    });
    setComponentPositions(positions);
  }, [components.length]); // Only reinitialize when components are added/removed

  // Handle drag start
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
      setCollisionWarning(null);
      if (showOccupiedAreas) {
        setTimeout(() => setShowOccupiedAreas(false), 500);
      }
    }
  }, [active, showOccupiedAreas]);

  // Clear drag state if component was deleted
  useEffect(() => {
    if (activeId && !components.find((c) => c.id === activeId)) {
      setActiveId(null);
      setDraggedComponentType(null);
      setIsDragging(false);
      setCollisionWarning(null);
      setShowOccupiedAreas(false);
    }
  }, [activeId, components]);

  // Clear selected component if deleted
  useEffect(() => {
    if (selectedComponentId && !components.find((c) => c.id === selectedComponentId)) {
      setSelectedComponentId(null);
    }
  }, [selectedComponentId, components, setSelectedComponentId]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedComponentId) {
        e.preventDefault();
        onComponentDelete(selectedComponentId);
        setSelectedComponentId(null);
      }

      if (e.key === "Escape" && selectedComponentId) {
        setSelectedComponentId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedComponentId, onComponentDelete, setSelectedComponentId]);

  // Store drag data
  useEffect(() => {
    if (active) {
      (window as any).__lastDragData = active.data.current;
    }
  }, [active]);

  // Handle resize
  const handleResize = useCallback(
    (id: string, newSize: { w: number; h: number }) => {
      const component = components.find((c) => c.id === id);
      if (!component) return;

      const wouldCollide = !canPlaceComponent(
        component.position.x,
        component.position.y,
        newSize.w,
        newSize.h,
        components,
        id,
        GRID_SIZE,
      );

      if (wouldCollide) {
        setCollisionWarning(id);
      } else {
        setCollisionWarning(null);
      }

      onComponentUpdate(id, {
        position: {
          ...component.position,
          w: newSize.w,
          h: newSize.h,
        },
      });
    },
    [components, onComponentUpdate],
  );

  const handleLayerChange = useCallback(
    (id: string, direction: "front" | "back") => {
      const component = components.find((c) => c.id === id);
      if (!component) return;

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
    [components, onComponentUpdate],
  );

  // Handle position updates from drag (like BasicSetup example)
  const handlePositionUpdate = useCallback(
    (id: string, delta: { x: number; y: number }) => {
      setComponentPositions((prev) => {
        const current = prev[id] || { x: 0, y: 0 };
        return {
          ...prev,
          [id]: {
            x: current.x + delta.x,
            y: current.y + delta.y,
          },
        };
      });
    },
    [],
  );

  // Finalize position on drag end
  const handleDragEndPosition = useCallback(
    (id: string) => {
      const pixelPosition = componentPositions[id];
      if (!pixelPosition) return;

      const component = components.find((c) => c.id === id);
      if (!component) return;

      // Snap to grid
      const snapped = snapToGrid(pixelPosition.x, pixelPosition.y);
      const gridX = Math.max(0, pixelToGrid(snapped.x));
      const gridY = Math.max(0, pixelToGrid(snapped.y));

      // Clamp to canvas bounds
      const maxGridX = Math.floor(canvasSize.width / GRID_SIZE);
      const maxGridY = Math.floor(canvasSize.height / GRID_SIZE);

      const finalX = Math.min(gridX, maxGridX - component.position.w);
      const finalY = Math.min(gridY, maxGridY - component.position.h);

      // Check for collisions
      const otherComponents = components.filter((c) => c.id !== id);
      const wouldCollide = !canPlaceComponent(
        finalX,
        finalY,
        component.position.w,
        component.position.h,
        otherComponents,
        undefined,
        GRID_SIZE,
      );

      if (wouldCollide) {
        setCollisionWarning(id);
        setTimeout(() => setCollisionWarning(null), 2000);
      }

      // Update component position
      onComponentUpdate(id, {
        position: {
          x: finalX,
          y: finalY,
          w: component.position.w,
          h: component.position.h,
        },
      });

      // Update stored position to match final position
      setComponentPositions((prev) => ({
        ...prev,
        [id]: {
          x: finalX * GRID_SIZE,
          y: finalY * GRID_SIZE,
        },
      }));
    },
    [componentPositions, components, onComponentUpdate, canvasSize, snapToGrid, pixelToGrid],
  );

  // Grid pattern
  const gridPattern = useMemo(() => {
    const pattern = [];
    for (let i = 0; i <= GRID_COLS; i++) {
      pattern.push(
        <div
          key={`col-${i}`}
          className="absolute border-l border-border/30"
          style={{ left: `${i * GRID_SIZE}px`, width: "1px", height: "100%" }}
        />,
      );
    }
    for (let i = 0; i <= GRID_ROWS; i++) {
      pattern.push(
        <div
          key={`row-${i}`}
          className="absolute border-t border-border/30"
          style={{ top: `${i * GRID_SIZE}px`, width: "100%", height: "1px" }}
        />,
      );
    }
    return pattern;
  }, []);

  return (
    <>
      <CanvasDropZone
        onDropNewComponent={(componentType: string, dropX: number, dropY: number) => {
          const defaultWidth = 6;
          const defaultHeight = 4;

          const actualCanvasWidth = canvasSize.width || GRID_COLS * GRID_SIZE;
          const placementCanvasHeight = Math.max(canvasSize.height || 800, 10000);

          const dropGridX = Math.max(0, Math.floor((dropX - 20) / GRID_SIZE));
          const dropGridY = Math.max(0, Math.floor((dropY - 20) / GRID_SIZE));

          let bestPosition: { x: number; y: number };
          if (
            canPlaceComponent(
              dropGridX,
              dropGridY,
              defaultWidth,
              defaultHeight,
              components,
              undefined,
              GRID_SIZE,
            )
          ) {
            bestPosition = { x: dropGridX, y: dropGridY };
          } else {
            bestPosition = findBestPosition(
              defaultWidth,
              defaultHeight,
              components,
              actualCanvasWidth,
              placementCanvasHeight,
              GRID_SIZE,
            );
          }

          const newComponent: DashboardComponent = {
            id: nanoid(),
            type: componentType,
            position: {
              x: bestPosition.x,
              y: bestPosition.y,
              w: defaultWidth,
              h: defaultHeight,
            },
            config: {},
            zIndex: components.length > 0 ? Math.max(...components.map((c) => c.zIndex || 0)) + 1 : 1,
          };

          onComponentsChange([...components, newComponent]);
          setShowOccupiedAreas(true);
          setTimeout(() => setShowOccupiedAreas(false), 1000);
        }}
      >
        <ScrollArea className="w-full h-full">
          <section
            ref={canvasRef}
            className={cn(
              "relative bg-background",
              isDragging && "bg-muted/50",
              className,
            )}
            style={{
              width: "100%",
              height: `${Math.max(canvasSize.height || 1000, 1000)}px`,
              minHeight: "1000px",
              padding: "20px",
              boxSizing: "border-box",
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border) / 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border) / 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
              transition: isDragging ? "none" : "background-size 0.2s ease-out",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget || (e.target as HTMLElement).id === "canvas-drop-zone") {
                setSelectedComponentId(null);
              }
            }}
            tabIndex={0}
            aria-label="Dashboard canvas"
          >
            {/* Grid overlay - visible when dragging */}
            {isDragging && (
              <div className="absolute inset-0 pointer-events-none opacity-30">
                {gridPattern}
              </div>
            )}

            {/* Occupied areas overlay */}
            {showOccupiedAreas && (
              <div className="absolute inset-0 pointer-events-none">
                {components.map((component) => {
                  const rect = componentToRect(component, GRID_SIZE);
                  return (
                    <div
                      key={`occupied-${component.id}`}
                      className="absolute border-2 border-dashed border-muted-foreground/20 bg-muted/5"
                      style={{
                        left: `${rect.x}px`,
                        top: `${rect.y}px`,
                        width: `${rect.width}px`,
                        height: `${rect.height}px`,
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Components */}
            {components.map((component) => (
              <DashboardItem
                key={component.id}
                component={component}
                gridSize={GRID_SIZE}
                canvasWidth={canvasSize.width || GRID_COLS * GRID_SIZE}
                canvasHeight={canvasSize.height || GRID_ROWS * GRID_SIZE}
                onResize={handleResize}
                onDelete={onComponentDelete}
                onLayerChange={handleLayerChange}
                onUpdate={onComponentUpdate}
                hasCollision={collisionWarning === component.id}
                isSelected={selectedComponentId === component.id}
                onSelect={setSelectedComponentId}
                onPositionUpdate={handlePositionUpdate}
                onDragEnd={handleDragEndPosition}
                currentPosition={componentPositions[component.id]}
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
          </section>
        </ScrollArea>
      </CanvasDropZone>

      {/* Drag Overlay - Only for new components from palette */}
      {isDragging && active && (
        <DragOverlay dropAnimation={null} adjustScale={false}>
          {(() => {
            const activeData = active.data.current;
            if (activeData?.type === "palette" && activeData?.componentType) {
              const defaultWidth = 6 * GRID_SIZE;
              const defaultHeight = 4 * GRID_SIZE;

              return (
                <div
                  className="bg-background/80 border-2 border-border rounded-lg backdrop-blur-sm flex items-center justify-center"
                  style={{
                    width: `${defaultWidth}px`,
                    height: `${defaultHeight}px`,
                    opacity: 0.9,
                    cursor: "grabbing",
                  }}
                >
                  <div className="text-foreground text-xs font-medium text-center px-2">
                    {activeData.componentType.replace(/-/g, " ")}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </DragOverlay>
      )}
    </>
  );
}

export function DashboardCanvasWithHandlers(props: DashboardCanvasProps) {
  return <DashboardCanvas {...props} />;
}

function CanvasDropZone({ 
  children,
  onDropNewComponent,
}: { 
  children: React.ReactNode;
  onDropNewComponent: (componentType: string, x: number, y: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-drop-zone",
  });

  const { active } = useDndContext();

  useEffect(() => {
    const handleDragEnd = () => {
      const lastActiveData = (window as any).__lastDragData;
      const lastOver = (window as any).__lastOver;

      if (lastOver?.id === "canvas-drop-zone" && lastActiveData?.type === "palette" && lastActiveData?.componentType) {
        const canvasElement = document.getElementById("canvas-drop-zone");
        if (canvasElement) {
          const canvasRect = canvasElement.getBoundingClientRect();
          const dropX = (window as any).__lastDropX || canvasRect.width / 2;
          const dropY = (window as any).__lastDropY || canvasRect.height / 2;

          onDropNewComponent(lastActiveData.componentType, dropX, dropY);
        }

        delete (window as any).__lastDragData;
        delete (window as any).__lastOver;
        delete (window as any).__lastDropX;
        delete (window as any).__lastDropY;
      }
    };

    if (!active) {
      handleDragEnd();
    }
  }, [active, onDropNewComponent]);

  return (
    <div
      id="canvas-drop-zone"
      ref={setNodeRef}
      className={cn(
        "relative w-full h-full min-h-[600px]",
        isOver && "ring-2 ring-primary ring-offset-2",
      )}
    >
      {children}
    </div>
  );
}