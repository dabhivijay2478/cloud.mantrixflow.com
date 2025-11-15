"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: component.id,
      data: {
        type: "dashboard-item",
        // CRITICAL FIX: Don't store component snapshot - only store ID
        // The canvas will look up the current component from the array
        componentId: component.id,
      },
      disabled: isResizing, // Disable drag when resizing
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    zIndex:
      isDragging || isResizing
        ? (component.zIndex || 1) + 1000
        : component.zIndex || 1,
  };

  // Convert grid units to pixels
  const width = component.position.w * gridSize;
  const height = component.position.h * gridSize;
  const left = component.position.x * gridSize;
  const top = component.position.y * gridSize;

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
      let newX = component.position.x;
      let newY = component.position.y;
      let newXPixels = component.position.x * gridSize;
      let newYPixels = component.position.y * gridSize;

      // Calculate new dimensions based on handle
      // East (right) and South (bottom) handles: grow/shrink from bottom-right
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

      // West (left) and North (top) handles: grow/shrink from top-left, need to adjust position
      if (resizeHandle.includes("w")) {
        const newW = Math.max(
          minWidth,
          Math.min(maxWidth, resizeStart.width - deltaX),
        );
        const deltaW = resizeStart.width - newW; // Positive when shrinking, negative when growing
        const currentXPixels = component.position.x * gridSize;
        newXPixels = currentXPixels + deltaW; // Move left when shrinking, right when growing
        newX = Math.max(0, newXPixels) / gridSize;
        newWidth = newW;
      }
      if (resizeHandle.includes("n")) {
        const newH = Math.max(
          minHeight,
          Math.min(maxHeight, resizeStart.height - deltaY),
        );
        const deltaH = resizeStart.height - newH; // Positive when shrinking, negative when growing
        const currentYPixels = component.position.y * gridSize;
        newYPixels = currentYPixels + deltaH; // Move up when shrinking, down when growing
        newY = Math.max(0, newYPixels) / gridSize;
        newHeight = newH;
      }

      // Snap to grid
      const snappedWidth = Math.round(newWidth / gridSize) * gridSize;
      const snappedHeight = Math.round(newHeight / gridSize) * gridSize;
      const snappedX = Math.round(newXPixels / gridSize);
      const snappedY = Math.round(newYPixels / gridSize);

      // Update position if resizing from top or left
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

  // Handle click to select
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        setIsSelected(false);
      }
    };

    if (isSelected) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isSelected]);

  // Render resize handles
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
      <div
        key={handle}
        role="button"
        tabIndex={0}
        className={cn(
          "absolute z-[100] pointer-events-auto touch-none select-none",
          "bg-primary/30 border border-primary/60 rounded-sm",
          "hover:bg-primary/50 hover:border-primary transition-colors",
          isHovered || isSelected ? "opacity-100" : "opacity-0",
          handleClasses[handle],
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
        ...style,
        overflow: "visible",
      }}
    >
      <div
        ref={(node) => {
          setNodeRef(node);
          itemRef.current = node as HTMLDivElement;
        }}
        role="button"
        tabIndex={0}
        className={cn(
          "relative w-full h-full bg-transparent border-2 rounded-lg shadow-sm transition-all",
          isSelected
            ? "border-primary ring-2 ring-primary/20"
            : "border-transparent",
          isDragging && "opacity-30 cursor-grabbing border-blue-500/50",
          isHovered && !isResizing && "border-border",
          isResizing && "border-primary/50",
          hasCollision &&
            "border-destructive ring-2 ring-destructive/30 animate-pulse",
        )}
        style={{
          transform: CSS.Translate.toString(transform),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          if (!isResizing && onSelect) {
            e.stopPropagation();
            onSelect(component.id);
          }
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isResizing && onSelect) {
            e.preventDefault();
            e.stopPropagation();
            onSelect(component.id);
          }
        }}
      >
        {/* Drag Handle - Only visible when not resizing */}
        {!isResizing && (
          <div
            {...attributes}
            {...listeners}
            className={cn(
              "absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing",
              "bg-background/90 backdrop-blur-sm rounded p-1.5 border shadow-sm",
              "hover:bg-blue-500/20 hover:border-blue-500 transition-all pointer-events-auto",
              "active:bg-blue-500/30 active:border-blue-600",
              isHovered || isSelected ? "opacity-100" : "opacity-0",
            )}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <GripVertical
              className={cn(
                "w-4 h-4 transition-colors",
                isDragging ? "text-blue-600" : "text-muted-foreground",
              )}
            />
          </div>
        )}

        {/* Toolbar - Only visible on hover/select, positioned outside content */}
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

        {/* Component Content - Responsive wrapper */}
        <div
          className="h-full w-full overflow-hidden"
          style={{
            minWidth: 0,
            minHeight: 0,
          }}
        >
          {children}
        </div>

        {/* Selection indicator */}
        {isSelected && !isResizing && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -inset-1 border-2 border-primary/50 rounded-lg animate-pulse" />
          </div>
        )}

        {/* Collision warning indicator */}
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
    </div>
  );
}
