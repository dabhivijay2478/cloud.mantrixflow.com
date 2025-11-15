"use client";

import { DragOverlay, useDndContext, useDroppable } from "@dnd-kit/core";
import { nanoid } from "nanoid";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DashboardComponent } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import {
  canPlaceComponent,
  checkCollisionWithComponents,
  componentToRect,
  findBestPosition,
  getBoundingBox,
  getNearestValidPosition,
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
  const [draggedComponentType, setDraggedComponentType] = useState<
    string | null
  >(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);
  const [showOccupiedAreas, setShowOccupiedAreas] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null,
  );
  const canvasRef = useRef<HTMLDivElement>(null);
  const { active, over, delta } = useDndContext();
  const prevActiveRef = React.useRef(active);
  const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Calculate canvas size based on viewport and component positions
  useEffect(() => {
    const updateCanvasSize = () => {
      // Get viewport from parent container, not canvas itself
      // Try multiple parent levels to find the actual scroll container
      let scrollContainer = canvasRef.current?.parentElement?.parentElement;

      // If not found, try going up more levels (for responsive layout changes)
      if (!scrollContainer || scrollContainer.clientWidth === 0) {
        scrollContainer =
          canvasRef.current?.parentElement?.parentElement?.parentElement;
      }

      if (scrollContainer) {
        const viewportWidth = Math.max(scrollContainer.clientWidth || 0, 320); // Minimum 320px for mobile
        const viewportHeight = Math.max(scrollContainer.clientHeight || 0, 400); // Minimum height

        // Calculate content size based on component positions
        const boundingBox = getBoundingBox(components, GRID_SIZE);
        const padding = 200; // Extra padding for comfortable scrolling and adding new components

        if (boundingBox && components.length > 0) {
          // Calculate the bottom-most point of all components (in pixels)
          const bottomMostPoint = boundingBox.y + boundingBox.height;
          const contentHeight = bottomMostPoint + padding;

          // Canvas width = viewport width (no horizontal scrolling)
          // Canvas height = max of viewport or content (vertical scrolling when needed)
          const newHeight = Math.max(viewportHeight + 400, contentHeight);

          setCanvasSize({
            width: viewportWidth, // Always match viewport width
            height: newHeight, // Expand to fit all components with padding
          });
        } else {
          // No components, use viewport size with minimum height
          setCanvasSize({
            width: viewportWidth,
            height: Math.max(viewportHeight, 1000), // Minimum 1000px height for empty canvas
          });
        }
      }
    };

    // Update immediately and after a short delay to ensure DOM is ready
    updateCanvasSize();
    const timeoutId = setTimeout(updateCanvasSize, 100);
    const timeoutId2 = setTimeout(updateCanvasSize, 500); // Additional delay for panel animations

    // Use ResizeObserver for better performance - observe multiple containers
    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to batch updates
      requestAnimationFrame(updateCanvasSize);
    });

    // Observe the canvas container and its parents
    const scrollContainer = canvasRef.current?.parentElement?.parentElement;
    if (scrollContainer) {
      resizeObserver.observe(scrollContainer);
    }

    // Also observe the main panel container if available
    const mainPanel = document.getElementById("main-panel");
    if (mainPanel) {
      resizeObserver.observe(mainPanel);
    }

    window.addEventListener("resize", updateCanvasSize);

    // Listen for panel resize events (from ResizablePanelGroup)
    const handlePanelResize = () => {
      requestAnimationFrame(updateCanvasSize);
    };

    // Use a MutationObserver to detect when panels expand/collapse
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

  // Handle real-time drag updates with collision detection
  useEffect(() => {
    if (!active || !delta) return;

    const activeData = active.data.current;
    // CRITICAL FIX: Check for componentId instead of component snapshot
    if (activeData?.type === "dashboard-item") {
      const componentId = active.id as string;

      // ROOT CAUSE FIX: Always get current component from components array
      // Never trust active.data.current.component as it's a stale snapshot
      const component = components.find((c) => c.id === componentId);

      // Safety check: If component was deleted during drag, cancel the drag
      if (!component) {
        // Component was deleted, clear drag state immediately
        dragStartPositionRef.current = null;
        setActiveId(null);
        setDraggedComponentType(null);
        setIsDragging(false);
        setCollisionWarning(null);
        return;
      }

      // Store start position on drag start
      if (!dragStartPositionRef.current) {
        dragStartPositionRef.current = {
          x: component.position.x * GRID_SIZE,
          y: component.position.y * GRID_SIZE,
        };
      }

      // Calculate new position - follow mouse exactly for free rearrangement
      if (dragStartPositionRef.current) {
        const newX = dragStartPositionRef.current.x + delta.x;
        const newY = dragStartPositionRef.current.y + delta.y;

        const snapped = snapToGrid(newX, newY);
        let gridX = pixelToGrid(snapped.x);
        let gridY = pixelToGrid(snapped.y);

        // Calculate canvas bounds in grid units
        const maxGridX = Math.floor(canvasSize.width / GRID_SIZE);
        const maxGridY = Math.floor(canvasSize.height / GRID_SIZE);

        // Clamp to canvas bounds (prevent going off canvas)
        gridX = Math.max(0, Math.min(gridX, maxGridX - component.position.w));
        gridY = Math.max(0, Math.min(gridY, maxGridY - component.position.h));

        // ROOT CAUSE FIX: Use current components array for collision detection
        // Filter out the component being dragged to avoid self-collision
        // This ensures deleted components are never included in collision checks
        const otherComponents = components.filter((c) => c.id !== component.id);
        const wouldCollide = !canPlaceComponent(
          gridX,
          gridY,
          component.position.w,
          component.position.h,
          otherComponents, // Only check against other components (excludes self and deleted ones)
          undefined, // No need to exclude since we already filtered
          GRID_SIZE,
        );

        // Show collision warning but allow free movement
        if (wouldCollide) {
          setCollisionWarning(component.id);
        } else {
          setCollisionWarning(null);
        }

        // Update position in real-time - follow mouse exactly
        // User can rearrange freely, even if it overlaps (they'll see warning)
        onComponentUpdate(component.id, {
          position: {
            ...component.position,
            x: gridX,
            y: gridY,
          },
        });
      }
    }
  }, [
    active,
    delta,
    canvasSize,
    snapToGrid,
    pixelToGrid,
    onComponentUpdate,
    components,
  ]);

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

  // CRITICAL FIX: Clear drag state if the component being dragged is deleted
  useEffect(() => {
    if (activeId && !components.find((c) => c.id === activeId)) {
      // Component was deleted while being dragged, clear all drag state
      dragStartPositionRef.current = null;
      setActiveId(null);
      setDraggedComponentType(null);
      setIsDragging(false);
      setCollisionWarning(null);
    }
  }, [activeId, components]);

  // CRITICAL FIX: Clear selected component if it was deleted
  useEffect(() => {
    if (
      selectedComponentId &&
      !components.find((c) => c.id === selectedComponentId)
    ) {
      setSelectedComponentId(null);
    }
  }, [selectedComponentId, components]);

  // Keyboard delete handler - Delete or Backspace to delete selected component
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Delete or Backspace key
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedComponentId
      ) {
        e.preventDefault();
        onComponentDelete(selectedComponentId);
        setSelectedComponentId(null);
      }

      // Escape to deselect
      if (e.key === "Escape" && selectedComponentId) {
        setSelectedComponentId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedComponentId, onComponentDelete]);

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

  // Handle drag end when dropped on canvas (for new components from palette)
  useEffect(() => {
    // Detect when drag ends (active goes from non-null to null)
    const wasDragging = prevActiveRef.current !== null;
    const justEnded = wasDragging && active === null;

    prevActiveRef.current = active;

    if (justEnded && (window as any).__lastDragData) {
      const lastActiveData = (window as any).__lastDragData;
      const lastOver = (window as any).__lastOver;

      if (lastOver?.id === "canvas-drop-zone") {
        if (
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
          const dropX = (window as any).__lastDropX || canvasRect.width / 2;
          const dropY = (window as any).__lastDropY || canvasRect.height / 2;

          // Default component size
          const defaultWidth = 6;
          const defaultHeight = 4;

          // ROOT CAUSE FIX: Use actual canvas width, not just viewport width
          // This ensures we can place components anywhere on the canvas, including right side
          const actualCanvasWidth =
            canvasSize.width || canvasRect.width || GRID_COLS * GRID_SIZE;

          // Use a large canvas height for placement (allows infinite vertical space)
          // This ensures components can always be placed, canvas will expand with scrolling
          const placementCanvasHeight = Math.max(
            canvasSize.height || 800,
            10000, // Large enough to allow many components
          );

          // ROOT CAUSE FIX: Try to place near drop position first, then fall back to auto-placement
          // Convert drop position to grid coordinates
          const dropGridX = Math.max(0, Math.floor((dropX - 20) / GRID_SIZE)); // Subtract padding
          const dropGridY = Math.max(0, Math.floor((dropY - 20) / GRID_SIZE)); // Subtract padding

          // Check if drop position is available
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
            // Drop position is available, use it
            bestPosition = { x: dropGridX, y: dropGridY };
          } else {
            // Drop position is occupied, use intelligent auto-placement
            // This ensures components never overlap (like Power BI/Tableau)
            bestPosition = findBestPosition(
              defaultWidth,
              defaultHeight,
              components,
              actualCanvasWidth, // Use actual canvas width, not viewport
              placementCanvasHeight,
              GRID_SIZE,
            );
          }

          // Use auto-placement position (ensures no overlap)
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

          // Show occupied areas briefly after adding component
          setShowOccupiedAreas(true);
          setTimeout(() => setShowOccupiedAreas(false), 1000);
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
  }, [
    active,
    activeId,
    components,
    onComponentsChange,
    snapToGrid,
    pixelToGrid,
    canvasSize,
  ]);

  // Store drag data before it's cleared
  useEffect(() => {
    if (active) {
      (window as any).__lastDragData = active.data.current;
    }
  }, [active]);

  const handleResize = useCallback(
    (id: string, newSize: { w: number; h: number }) => {
      const component = components.find((c) => c.id === id);
      if (!component) return;

      // Check if resize would cause collision
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
        // Still allow resize but show warning
        // In production, you might want to prevent resize or auto-adjust
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
          <div
            ref={canvasRef}
            className={cn(
              "relative bg-background",
              isDragging && "bg-muted/50",
              className,
            )}
            style={{
              width: "100%", // Always 100% of viewport width
              height: `${Math.max(canvasSize.height || 1000, 1000)}px`, // Minimum 1000px, expand as needed
              minHeight: "1000px", // Ensure minimum height for scrolling
              padding: "20px",
              boxSizing: "border-box",
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border) / 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border) / 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
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
          </div>
        </ScrollArea>
      </CanvasDropZone>

      {/* Drag Overlay - Blue preview when dragging */}
      {isDragging && active && (
        <DragOverlay dropAnimation={null}>
          {(() => {
            const activeData = active.data.current;
            // ROOT CAUSE FIX: Get current component from array, not from stale snapshot
            if (activeData?.type === "dashboard-item") {
              const componentId = active.id as string;
              const component = components.find((c) => c.id === componentId);

              if (component) {
                const width = component.position.w * GRID_SIZE;
                const height = component.position.h * GRID_SIZE;

                return (
                  <div
                    className="bg-blue-500/90 border-2 border-blue-600 rounded-lg shadow-2xl rotate-2"
                    style={{
                      width: `${width}px`,
                      height: `${height}px`,
                      opacity: 0.95,
                      cursor: "grabbing",
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
                  className="bg-blue-500/90 border-2 border-blue-600 rounded-lg shadow-2xl flex items-center justify-center rotate-2"
                  style={{
                    width: `${defaultWidth}px`,
                    height: `${defaultHeight}px`,
                    opacity: 0.95,
                    cursor: "grabbing",
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
