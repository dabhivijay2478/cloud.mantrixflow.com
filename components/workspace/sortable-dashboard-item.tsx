"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreVertical, X } from "lucide-react";
import type * as React from "react";
import { useState } from "react";
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

interface SortableDashboardItemProps {
  component: DashboardComponent;
  index: number;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  children: React.ReactNode;
}

export function SortableDashboardItem({
  component,
  index: _index,
  onDelete,
  isSelected = false,
  onSelect,
  children,
}: SortableDashboardItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Role is set conditionally when interactive handlers are present
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group bg-card border-2 rounded-lg shadow-sm transition-all duration-200",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border",
        isDragging && "opacity-50 cursor-grabbing border-primary/50",
        isHovered && !isDragging && "border-border shadow-md",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={
        onSelect
          ? (e) => {
              e.stopPropagation();
              onSelect(component.id);
            }
          : undefined
      }
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
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
      {!isDragging && (
        <button
          {...attributes}
          {...listeners}
          type="button"
          tabIndex={0}
          aria-label="Drag to reorder component"
          className={cn(
            "absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing",
            "bg-background/90 backdrop-blur-sm rounded p-1.5 border shadow-sm",
            "hover:bg-primary/20 hover:border-primary transition-all duration-150 pointer-events-auto",
            "active:bg-primary/30 active:border-primary active:scale-110",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "touch-none select-none",
            isHovered || isSelected ? "opacity-100" : "opacity-0",
          )}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
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
      <div className="h-full w-full overflow-hidden p-2">{children}</div>

      {/* Toolbar */}
      {(isHovered || isSelected) && !isDragging && (
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
