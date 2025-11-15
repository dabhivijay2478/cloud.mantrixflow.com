"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { ResizableBox } from "react-resizable";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, MoveUp, MoveDown, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DashboardComponent } from "@/lib/stores/workspace-store";

interface DashboardItemProps {
  component: DashboardComponent;
  gridSize: number;
  onResize: (id: string, size: { w: number; h: number }) => void;
  onDelete: (id: string) => void;
  onLayerChange: (id: string, direction: "front" | "back") => void;
  onUpdate: (id: string, updates: Partial<DashboardComponent>) => void;
  children: React.ReactNode;
}

export function DashboardItem({
  component,
  gridSize,
  onResize,
  onDelete,
  onLayerChange,
  onUpdate,
  children,
}: DashboardItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: component.id,
    data: {
      type: "dashboard-item",
      component,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: component.zIndex || 1,
  };

  // Convert grid units to pixels
  const width = component.position.w * gridSize;
  const height = component.position.h * gridSize;
  const left = component.position.x * gridSize;
  const top = component.position.y * gridSize;

  const handleResize = (e: React.SyntheticEvent, data: { size: { width: number; height: number } }) => {
    e.stopPropagation();
    e.preventDefault();
    const newW = Math.max(2, Math.round(data.size.width / gridSize));
    const newH = Math.max(2, Math.round(data.size.height / gridSize));
    onResize(component.id, { w: newW, h: newH });
  };

  const handleResizeStop = (e: React.SyntheticEvent, data: { size: { width: number; height: number } }) => {
    e.stopPropagation();
    e.preventDefault();
    const newW = Math.max(2, Math.round(data.size.width / gridSize));
    const newH = Math.max(2, Math.round(data.size.height / gridSize));
    onResize(component.id, { w: newW, h: newH });
  };

  // Handle click to select
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        setIsSelected(false);
      }
    };

    if (isSelected) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isSelected]);

  return (
    <ResizableBox
      width={width}
      height={height}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      minConstraints={[gridSize * 2, gridSize * 2]}
      maxConstraints={[gridSize * 12, gridSize * 20]}
      resizeHandles={["n", "s", "e", "w", "ne", "nw", "se", "sw"]}
      handle={(handleAxis, ref) => (
        <div
          ref={ref}
          className={cn(
            "absolute bg-primary border-2 border-primary rounded-sm z-50",
            "hover:bg-primary/80 transition-colors",
            handleAxis === "n" && "top-0 left-1/2 -translate-x-1/2 w-6 h-2 cursor-ns-resize",
            handleAxis === "s" && "bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 cursor-ns-resize",
            handleAxis === "e" && "right-0 top-1/2 -translate-y-1/2 w-2 h-6 cursor-ew-resize",
            handleAxis === "w" && "left-0 top-1/2 -translate-y-1/2 w-2 h-6 cursor-ew-resize",
            handleAxis === "ne" && "top-0 right-0 w-4 h-4 cursor-nesw-resize rounded-br-none",
            handleAxis === "nw" && "top-0 left-0 w-4 h-4 cursor-nwse-resize rounded-bl-none",
            handleAxis === "se" && "bottom-0 right-0 w-4 h-4 cursor-nwse-resize rounded-tl-none",
            handleAxis === "sw" && "bottom-0 left-0 w-4 h-4 cursor-nesw-resize rounded-tr-none",
            (isHovered || isSelected) ? "opacity-100" : "opacity-0"
          )}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        />
      )}
      className="group"
      style={{
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        zIndex: component.zIndex || 1,
      }}
    >
      <div
        ref={(node) => {
          setNodeRef(node);
          itemRef.current = node as HTMLDivElement;
        }}
        className={cn(
          "relative w-full h-full bg-transparent border-2 rounded-lg shadow-sm transition-all",
          isSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent",
          isDragging && "opacity-50 cursor-grabbing",
          isHovered && "border-border",
          !isDragging && "cursor-move"
        )}
        style={{
          transform: CSS.Translate.toString(transform),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsSelected(true)}
        {...(!isDragging ? attributes : {})}
        {...(!isDragging ? listeners : {})}
      >
        {/* Drag Handle - Only visible on hover/select, positioned outside content */}
        {(isHovered || isSelected) && (
          <div
            className={cn(
              "absolute -top-8 left-2 z-50 pointer-events-auto",
              "bg-background/95 backdrop-blur-sm rounded-md p-1.5 border shadow-sm",
              "cursor-grab active:cursor-grabbing"
            )}
            {...attributes}
            {...listeners}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        )}

        {/* Toolbar - Only visible on hover/select, positioned outside content */}
        {(isHovered || isSelected) && (
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
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onLayerChange(component.id, "front")}>
                  <MoveUp className="w-4 h-4 mr-2" />
                  Bring to Front
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLayerChange(component.id, "back")}>
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

        {/* Component Content - Clean, no padding wrapper, let component handle its own styling */}
        <div 
          className="h-full w-full"
          onMouseDown={(e) => {
            // Allow dragging from content area, but stop if clicking on interactive elements
            const target = e.target as HTMLElement;
            if (target.closest('button, a, input, select, textarea')) {
              e.stopPropagation();
            }
          }}
        >
          {children}
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -inset-1 border-2 border-primary/50 rounded-lg animate-pulse" />
          </div>
        )}
      </div>
    </ResizableBox>
  );
}

