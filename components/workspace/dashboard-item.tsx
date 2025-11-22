"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical, MoreVertical, MoveDown, MoveUp, X } from "lucide-react";
import type * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DashboardComponent } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";

interface DashboardItemProps {
  component: DashboardComponent;
  gridSize: number;
  canvasWidth: number;
  canvasHeight: number;
  onResize: (id: string, size: { w: number; h: number }) => void;
  onDelete: (id: string) => void;
  onLayerChange: (id: string, direction: "front" | "back") => void;
  onUpdate: (id: string, updates: Partial<DashboardComponent>) => void;
  hasCollision?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onPositionUpdate?: (id: string, delta: { x: number; y: number }) => void;
  onDragEnd?: (id: string) => void;
  currentPosition?: { x: number; y: number };
  children: React.ReactNode;
}

type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | null;

export function DashboardItem({
  component,
  gridSize,
  canvasWidth,
  canvasHeight,
  onResize,
  onDelete,
  onLayerChange,
  onUpdate,
  hasCollision = false,
  isSelected = false,
  onSelect,
  onPositionUpdate,
  onDragEnd,
  currentPosition,
  children,
}: DashboardItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const itemRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const prevDeltaRef = useRef({ x: 0, y: 0 });

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: component.id,
      data: {
        type: "dashboard-item",
        componentId: component.id,
      },
      disabled: isResizing,
    });

  // Handle position updates during drag (like BasicSetup example)
  useEffect(() => {
    if (isDragging && transform && onPositionUpdate) {
      const deltaX = transform.x - prevDeltaRef.current.x;
      const deltaY = transform.y - prevDeltaRef.current.y;

      if (deltaX !== 0 || deltaY !== 0) {
        onPositionUpdate(component.id, { x: deltaX, y: deltaY });
        prevDeltaRef.current = { x: transform.x, y: transform.y };
      }
    }

    if (
      !isDragging &&
      prevDeltaRef.current.x !== 0 &&
      prevDeltaRef.current.y !== 0
    ) {
      // Drag ended
      prevDeltaRef.current = { x: 0, y: 0 };
      if (onDragEnd) {
        onDragEnd(component.id);
      }
    }
  }, [isDragging, transform, onPositionUpdate, onDragEnd, component.id]);

  // Calculate position: use currentPosition from parent during drag, otherwise use component.position
  const left = currentPosition
    ? currentPosition.x
    : component.position.x * gridSize;
  const top = currentPosition
    ? currentPosition.y
    : component.position.y * gridSize;

  const width = component.position.w * gridSize;
  const height = component.position.h * gridSize;

  // Calculate max size based on canvas bounds
  const maxWidth = (canvasWidth / gridSize - component.position.x) * gridSize;
  const maxHeight = (canvasHeight / gridSize - component.position.y) * gridSize;
  const minWidth = gridSize * 2;
  const minHeight = gridSize * 2;

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      e.stopPropagation();
      e.preventDefault();
      setIsResizing(true);
      setResizeHandle(handle);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width,
        height,
      });
    },
    [width, height],
  );

  // Handle resize move
  useEffect(() => {
    if (!isResizing || !resizeHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newXPixels = component.position.x * gridSize;
      let newYPixels = component.position.y * gridSize;

      if (resizeHandle.includes("e")) {
        newWidth = Math.max(
          minWidth,
          Math.min(maxWidth, resizeStart.width + deltaX),
        );
      }
      if (resizeHandle.includes("s")) {
        newHeight = Math.max(
          minHeight,
          Math.min(maxHeight, resizeStart.height + deltaY),
        );
      }

      if (resizeHandle.includes("w")) {
        const newW = Math.max(
          minWidth,
          Math.min(maxWidth, resizeStart.width - deltaX),
        );
        const deltaW = resizeStart.width - newW;
        const currentXPixels = component.position.x * gridSize;
        newXPixels = currentXPixels + deltaW;
        newWidth = newW;
      }
      if (resizeHandle.includes("n")) {
        const newH = Math.max(
          minHeight,
          Math.min(maxHeight, resizeStart.height - deltaY),
        );
        const deltaH = resizeStart.height - newH;
        const currentYPixels = component.position.y * gridSize;
        newYPixels = currentYPixels + deltaH;
        newHeight = newH;
      }

      const snappedWidth = Math.round(newWidth / gridSize) * gridSize;
      const snappedHeight = Math.round(newHeight / gridSize) * gridSize;
      const snappedX = Math.round(newXPixels / gridSize);
      const snappedY = Math.round(newYPixels / gridSize);

      if (resizeHandle.includes("w") || resizeHandle.includes("n")) {
        onUpdate(component.id, {
          position: {
            x: snappedX,
            y: snappedY,
            w: Math.round(snappedWidth / gridSize),
            h: Math.round(snappedHeight / gridSize),
          },
        });
      } else {
        onResize(component.id, {
          w: Math.round(snappedWidth / gridSize),
          h: Math.round(snappedHeight / gridSize),
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isResizing,
    resizeHandle,
    resizeStart,
    component,
    gridSize,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    onResize,
    onUpdate,
  ]);

  const renderResizeHandle = (handle: ResizeHandle) => {
    const handleClasses = {
      n: "top-0 left-1/2 -translate-x-1/2 w-12 h-2 cursor-ns-resize",
      s: "bottom-0 left-1/2 -translate-x-1/2 w-12 h-2 cursor-ns-resize",
      e: "right-0 top-1/2 -translate-y-1/2 w-2 h-12 cursor-ew-resize",
      w: "left-0 top-1/2 -translate-y-1/2 w-2 h-12 cursor-ew-resize",
      ne: "top-0 right-0 w-4 h-4 cursor-nesw-resize rounded-br-none",
      nw: "top-0 left-0 w-4 h-4 cursor-nwse-resize rounded-bl-none",
      se: "bottom-0 right-0 w-4 h-4 cursor-nwse-resize rounded-tl-none",
      sw: "bottom-0 left-0 w-4 h-4 cursor-nesw-resize rounded-tr-none",
    };

    return (
      <button
        key={handle}
        type="button"
        tabIndex={0}
        aria-label={`Resize ${handle} handle`}
        className={cn(
          "absolute z-[100] pointer-events-auto touch-none select-none",
          "bg-primary/30 border border-primary/60 rounded-sm",
          "hover:bg-primary/50 hover:border-primary transition-colors",
          "cursor-resize",
          isHovered || isSelected ? "opacity-100" : "opacity-0",
          handle && handleClasses[handle],
        )}
        onMouseDown={(e) => handleResizeStart(e, handle)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleResizeStart(e as unknown as React.MouseEvent, handle);
          }
        }}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      />
    );
  };

  return (
    <div
      ref={resizeRef}
      className={cn(
        "group absolute",
        (isHovered || isSelected) && "resize-active",
        isResizing && "resizing",
      )}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex:
          isDragging || isResizing
            ? (component.zIndex || 1) + 1000
            : component.zIndex || 1,
        overflow: "visible",
      }}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Role is set conditionally when interactive handlers are present */}
      <div
        ref={(node) => {
          setNodeRef(node);
          itemRef.current = node as HTMLDivElement;
        }}
        {...attributes}
        {...(!isResizing ? listeners : {})}
        className={cn(
          "relative w-full h-full bg-transparent border-2 rounded-lg shadow-sm",
          "transition-all duration-200 ease-out",
          isSelected
            ? "border-primary ring-2 ring-primary/20"
            : "border-transparent",
          isDragging && "opacity-70 cursor-grabbing border-primary/50",
          isHovered && !isResizing && !isDragging && "border-border",
          isResizing && "border-primary/50 cursor-default",
          !isResizing && !isDragging && "cursor-move",
          hasCollision &&
            "border-destructive ring-2 ring-destructive/30 animate-pulse",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={
          onSelect
            ? (e) => {
                if (!isResizing) {
                  e.stopPropagation();
                  onSelect(component.id);
                }
              }
            : undefined
        }
        onKeyDown={
          onSelect
            ? (e) => {
                if (!isResizing && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(component.id);
                }
              }
            : undefined
        }
        role={onSelect ? "button" : undefined}
        tabIndex={onSelect ? 0 : undefined}
        {...(onSelect && { "aria-label": "Select component" })}
      >
        {/* Drag Handle */}
        {!isResizing && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Drag handle"
            className={cn(
              "absolute top-2 left-2 z-20 pointer-events-none",
              "bg-background/90 backdrop-blur-sm rounded p-1.5 border shadow-sm",
              "touch-none select-none",
              isHovered || isSelected ? "opacity-100" : "opacity-0",
            )}
          >
            <GripVertical
              className={cn(
                "w-4 h-4 transition-colors duration-150",
                isDragging ? "text-primary" : "text-muted-foreground",
              )}
            />
          </button>
        )}

        {/* Component Content */}
        <div
          className="h-full w-full overflow-hidden"
          style={{ minWidth: 0, minHeight: 0 }}
        >
          {children}
        </div>

        {/* Selection indicator */}
        {isSelected && !isResizing && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -inset-1 border-2 border-primary/50 rounded-lg animate-pulse" />
          </div>
        )}

        {/* Collision warning */}
        {hasCollision && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
              Overlapping!
            </div>
          </div>
        )}

        {/* Resize handles */}
        {(isHovered || isSelected || isResizing) && (
          <>
            {renderResizeHandle("n")}
            {renderResizeHandle("s")}
            {renderResizeHandle("e")}
            {renderResizeHandle("w")}
            {renderResizeHandle("ne")}
            {renderResizeHandle("nw")}
            {renderResizeHandle("se")}
            {renderResizeHandle("sw")}
          </>
        )}
      </div>

      {/* Toolbar */}
      {(isHovered || isSelected) && !isResizing && (
        <div className="absolute -top-8 right-2 z-50 flex items-center gap-1 pointer-events-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-background/95 backdrop-blur-sm border shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onClick={() => onLayerChange(component.id, "front")}
              >
                <MoveUp className="w-4 h-4 mr-2" />
                Bring to Front
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onLayerChange(component.id, "back")}
              >
                <MoveDown className="w-4 h-4 mr-2" />
                Send to Back
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(component.id)}
                className="text-destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-background/95 backdrop-blur-sm border shadow-sm hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(component.id);
            }}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
