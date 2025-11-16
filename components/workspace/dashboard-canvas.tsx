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

const GRID_SIZE = 20; // Grid cell size in pixels
const GRID_COLS = 12; // Number of grid columns
const GRID_ROWS = 40; // Number of grid rows

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
  const [_draggedComponentType, setDraggedComponentType] = useState<
    string | null
  >(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);
  const [showOccupiedAreas, setShowOccupiedAreas] = useState(false);
  const [internalSelectedComponentId, setInternalSelectedComponentId] =
    useState<string | null>(null);

  // Use external selectedComponentId if provided, otherwise use internal state
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
  const { active, delta } = useDndContext();
  const prevActiveRef = React.useRef(active);
  const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);
  const activeComponentIdRef = useRef<string | null>(null);

  // Calculate canvas size based on viewport and component positions
  useEffect(() => {
    const updateCanvasSize = () => {
      let scrollContainer = canvasRef.current?.parentElement?.parentElement;

      if (!scrollContainer || scrollContainer.clientWidth === 0) {
        scrollContainer =
          canvasRef.current?.parentElement?.parentElement?.parentElement;
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

  // Store drag start position when drag begins (for free positioning)
  useEffect(() => {
    if (active) {
      const activeData = active.data.current;
      if (activeData?.type === "dashboard-item") {
        const componentId = active.id as string;
        activeComponentIdRef.current = componentId;
        const component = components.find((c) => c.id === componentId);

        if (component && !dragStartPositionRef.current) {
          // Store the initial position in pixels when drag starts
          dragStartPositionRef.current = {
            x: component.position.x * GRID_SIZE,
            y: component.position.y * GRID_SIZE,
          };
        }
      }
    } else {
      // Clear when drag ends
      activeComponentIdRef.current = null;
    }
  }, [active, components]);

  // Reset drag start position and clear active state when drag ends
  useEffect(() => {
    if (!active) {
      dragStartPositionRef.current = null;
      setActiveId(null);
      setDraggedComponentType(null);
      setIsDragging(false);
      setCollisionWarning(null);
    }
  }, [active]);

  // Clear drag state if component was deleted
  useEffect(() => {
    if (activeId && !components.find((c) => c.id === activeId)) {
      dragStartPositionRef.current = null;
      setActiveId(null);
      setDraggedComponentType(null);
      setIsDragging(false);
      setCollisionWarning(null);
    }
  }, [activeId, components]);

  // Clear selected component if it was deleted
  useEffect(() => {
    if (
      selectedComponentId &&
      !components.find((c) => c.id === selectedComponentId)
    ) {
      setSelectedComponentId(null);
    }
  }, [selectedComponentId, components, setSelectedComponentId]);

  // Keyboard delete handler
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

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedComponentId
      ) {
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
    const wasDragging = prevActiveRef.current !== null;
    const justEnded = wasDragging && active === null;

    prevActiveRef.current = active;

    // biome-ignore lint/suspicious/noExplicitAny: Window extension for drag data
    if (justEnded && (window as any).__lastDragData) {
      // biome-ignore lint/suspicious/noExplicitAny: Window extension for drag data
      const lastActiveData = (window as any).__lastDragData;
      // biome-ignore lint/suspicious/noExplicitAny: Window extension for drag over
      const lastOver = (window as any).__lastOver;
      // biome-ignore lint/suspicious/noExplicitAny: Window extension for drag delta
      const lastDelta = (window as any).__lastDelta;

      if (lastOver?.id === "canvas-drop-zone") {
        // Handle moving existing components (free positioning)
        if (lastActiveData?.type === "dashboard-item") {
          // Use stored component ID from ref (more reliable than prevActiveRef)
          const componentId =
            activeComponentIdRef.current ||
            lastActiveData?.componentId ||
            (prevActiveRef.current?.id as string);
          if (componentId && lastDelta && dragStartPositionRef.current) {
            const component = components.find((c) => c.id === componentId);
            if (component) {
              // Calculate new position: start position + delta movement
              const newX = dragStartPositionRef.current.x + lastDelta.x;
              const newY = dragStartPositionRef.current.y + lastDelta.y;
              
              // Snap to grid
              const snapped = snapToGrid(newX, newY);
              let gridX = pixelToGrid(snapped.x);
              let gridY = pixelToGrid(snapped.y);

              // Calculate canvas bounds in grid units
              const maxGridX = Math.floor(canvasSize.width / GRID_SIZE);
              const maxGridY = Math.floor(canvasSize.height / GRID_SIZE);

              // Clamp to canvas bounds (allow slight negative for flexibility)
              gridX = Math.max(
                -component.position.w,
                Math.min(gridX, maxGridX),
              );
              gridY = Math.max(
                -component.position.h,
                Math.min(gridY, maxGridY),
              );

              // Check for collisions
              const otherComponents = components.filter((c) => c.id !== component.id);
              const wouldCollide = !canPlaceComponent(
                gridX,
                gridY,
                component.position.w,
                component.position.h,
                otherComponents,
                undefined,
                GRID_SIZE,
              );

              if (wouldCollide) {
                setCollisionWarning(component.id);
              } else {
                setCollisionWarning(null);
              }

              // Update position (allow even with collision for free positioning)
              onComponentUpdate(componentId, {
                position: {
                  x: gridX,
                  y: gridY,
                  w: component.position.w,
                  h: component.position.h,
                },
              });
            }
          }
          dragStartPositionRef.current = null;
        } else if (
          lastActiveData?.type === "palette" &&
          lastActiveData?.componentType
        ) {
          // Dropping from components panel
          const canvasElement = document.getElementById("canvas-drop-zone");
          if (!canvasElement) {
            setActiveId(null);
            setDraggedComponentType(null);
            return;
          }

          const canvasRect = canvasElement.getBoundingClientRect();
          // biome-ignore lint/suspicious/noExplicitAny: Window extension for drop coordinates
          const dropX = (window as any).__lastDropX || canvasRect.width / 2;
          // biome-ignore lint/suspicious/noExplicitAny: Window extension for drop coordinates
          const dropY = (window as any).__lastDropY || canvasRect.height / 2;

          const defaultWidth = 6;
          const defaultHeight = 4;

          const actualCanvasWidth =
            canvasSize.width || canvasRect.width || GRID_COLS * GRID_SIZE;

          const placementCanvasHeight = Math.max(
            canvasSize.height || 800,
            10000,
          );

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

          const finalX = bestPosition.x;
          const finalY = bestPosition.y;

          const newComponent: DashboardComponent = {
            id: nanoid(),
            type: lastActiveData.componentType,
            position: {
              x: finalX,
              y: finalY,
              w: defaultWidth,
              h: defaultHeight,
            },
            config: {},
            zIndex:
              components.length > 0
                ? Math.max(...components.map((c) => c.zIndex || 0)) + 1
                : 1,
          };

          onComponentsChange([...components, newComponent]);

          setShowOccupiedAreas(true);
          setTimeout(() => setShowOccupiedAreas(false), 1000);
        }

        setActiveId(null);
        setDraggedComponentType(null);
        // biome-ignore lint/suspicious/noExplicitAny: Window extension cleanup
        delete (window as any).__lastDragData;
        // biome-ignore lint/suspicious/noExplicitAny: Window extension cleanup
        delete (window as any).__lastOver;
        // biome-ignore lint/suspicious/noExplicitAny: Window extension cleanup
        delete (window as any).__lastDelta;
        // biome-ignore lint/suspicious/noExplicitAny: Window extension cleanup
        delete (window as any).__lastDropX;
        // biome-ignore lint/suspicious/noExplicitAny: Window extension cleanup
        delete (window as any).__lastDropY;
      }
    }
  }, [
    active,
    components,
    onComponentsChange,
    onComponentUpdate,
    canvasSize,
    snapToGrid,
    pixelToGrid,
  ]);

  // Store drag data before it's cleared
  useEffect(() => {
    if (active) {
      // biome-ignore lint/suspicious/noExplicitAny: Window extension for drag data
      (window as any).__lastDragData = active.data.current;
    }
  }, [active]);

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

  // Grid background pattern
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
      <CanvasDropZone>
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
              // Deselect when clicking on blank canvas area
              if (
                e.target === e.currentTarget ||
                (e.target as HTMLElement).id === "canvas-drop-zone"
              ) {
                setSelectedComponentId(null);
              }
            }}
            onKeyDown={(e) => {
              // Deselect when pressing Enter or Space on blank canvas area
              if (e.key === "Enter" || e.key === " ") {
                if (
                  e.target === e.currentTarget ||
                  (e.target as HTMLElement).id === "canvas-drop-zone"
                ) {
                  e.preventDefault();
                  setSelectedComponentId(null);
                }
              }
            }}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: Canvas area needs keyboard interaction for accessibility
            tabIndex={0}
            aria-label="Dashboard canvas"
          >
            {/* Grid overlay - visible when dragging */}
            {isDragging && (
              <div className="absolute inset-0 pointer-events-none opacity-30">
                {gridPattern}
              </div>
            )}

            {/* Occupied areas overlay (visual feedback) */}
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
                onSelect={(id) => setSelectedComponentId(id)}
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
                    Drag components from the left panel to start building your
                    dashboard
                  </p>
                </div>
              </div>
            )}
          </section>
        </ScrollArea>
      </CanvasDropZone>

      {/* Drag Overlay - Enhanced preview when dragging */}
      {isDragging && active && (
        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: "ease-out",
          }}
          adjustScale={true}
        >
          {(() => {
            const activeData = active.data.current;
            if (activeData?.type === "dashboard-item") {
              const componentId = active.id as string;
              const component = components.find((c) => c.id === componentId);

              if (component) {
                const width = component.position.w * GRID_SIZE;
                const height = component.position.h * GRID_SIZE;
                const hasCollision = collisionWarning === component.id;

                return (
                  <div
                    className={cn(
                      "border-2 rounded-lg shadow-2xl transition-all",
                      hasCollision
                        ? "bg-destructive/90 border-destructive rotate-2"
                        : "bg-primary/90 border-primary rotate-2",
                    )}
                    style={{
                      width: `${width}px`,
                      height: `${height}px`,
                      opacity: 0.95,
                      cursor: "grabbing",
                      transform: "rotate(2deg) scale(1.02)",
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <div className="text-white text-xs font-medium text-center">
                        {component.type.replace(/-/g, " ")}
                      </div>
                    </div>
                  </div>
                );
              }
            } else if (
              activeData?.type === "palette" &&
              activeData?.componentType
            ) {
              // Preview for new component from palette
              const defaultWidth = 6 * GRID_SIZE;
              const defaultHeight = 4 * GRID_SIZE;

              return (
                <div
                  className="bg-primary/90 border-2 border-primary rounded-lg shadow-2xl flex items-center justify-center"
                  style={{
                    width: `${defaultWidth}px`,
                    height: `${defaultHeight}px`,
                    opacity: 0.95,
                    cursor: "grabbing",
                    transform: "rotate(2deg) scale(1.02)",
                  }}
                >
                  <div className="text-white text-xs font-medium text-center px-2">
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
        isOver && "ring-2 ring-primary ring-offset-2",
      )}
    >
      {children}
    </div>
  );
}
