"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Activity,
  AreaChart,
  BarChart2,
  BarChart3,
  Calendar,
  Circle,
  CircleDot,
  Filter,
  Gauge,
  GitBranch,
  Grid3x3,
  LayoutGrid,
  LineChart as LineChartIcon,
  Map as MapIcon,
  MapPin,
  MessageSquare,
  PieChart,
  Table,
  TrendingUp,
  X,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import { getAllCategories, getComponentsByCategory } from "@/components/bi/schemas";

// Icon mapping for component types
const iconMap: Record<string, LucideIcon> = {
  LineChart: LineChartIcon,
  BarChart: BarChart2,
  BarChart3: BarChart3,
  AreaChart: AreaChart,
  PieChart: PieChart,
  CircleDot: CircleDot,
  Circle: Circle,
  Gauge: Gauge,
  TrendingUp: TrendingUp,
  Table: Table,
  Filter: Filter,
  Calendar: Calendar,
  Map: MapIcon,
  MapPin: MapPin,
  Grid3x3: Grid3x3,
  LayoutGrid: LayoutGrid,
  GitBranch: GitBranch,
  MessageSquare: MessageSquare,
  Activity: Activity,
};

function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] || Activity; // Default to Activity icon if not found
}

// Get all components dynamically from schemas
function getAllComponentsFromSchemas() {
  const categories = getAllCategories();
  const components: Array<{
    id: string;
    name: string;
    icon: LucideIcon;
    description: string;
    category: string;
  }> = [];

  categories.forEach((category) => {
    const categoryComponents = getComponentsByCategory(category);
    categoryComponents.forEach((schema) => {
      components.push({
        id: schema.componentType,
        name: schema.displayName,
        icon: getIconComponent(schema.icon),
        description: schema.description,
        category: schema.category,
      });
    });
  });

  return components;
}

interface DraggableComponentButtonProps {
  component: {
    id: string;
    name: string;
    icon: LucideIcon;
    description: string;
  };
}

function DraggableComponentButton({
  component,
}: DraggableComponentButtonProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `component-${component.id}`,
      data: {
        type: "palette",
        componentType: component.id,
      },
    });

  const style = transform
    ? {
      transform: CSS.Translate.toString(transform),
    }
    : undefined;

  const Icon = component.icon;

  return (
    <Button
      ref={setNodeRef}
      variant="ghost"
      size="icon"
      className={cn(
        "h-12 w-12 cursor-grab active:cursor-grabbing transition-all",
        isDragging && "opacity-50 scale-95",
      )}
      style={style}
      {...listeners}
      {...attributes}
    >
      <Icon
        className={cn(
          "h-5 w-5 transition-colors",
          isDragging && "text-blue-600",
        )}
      />
    </Button>
  );
}

export function ComponentsPanel() {
  const { componentsPanelOpen, setComponentsPanelOpen } = useWorkspaceStore();
  const allComponents = getAllComponentsFromSchemas();

  // Group components by category
  const componentsByCategory = allComponents.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, typeof allComponents>);

  if (!componentsPanelOpen) {
    return (
      <button
        type="button"
        className="h-full w-full border-r bg-muted/30 flex flex-col items-center relative cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setComponentsPanelOpen(true)}
      >
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
        <div className="flex flex-col items-center justify-center flex-1 w-full py-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 mb-4 rounded-md flex items-center justify-center">
                  <BarChart3 className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Click to expand Components</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex-1 flex items-center justify-center">
            <span
              className="text-xs text-muted-foreground select-none"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                textOrientation: "mixed",
              }}
            >
              Components
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="h-full w-full border-r bg-muted/30 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <h2 className="font-semibold text-sm">Components</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setComponentsPanelOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          <TooltipProvider delayDuration={200}>
            {Object.entries(componentsByCategory).map(([category, components]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {category}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {components.map((component) => (
                    <Tooltip key={component.id}>
                      <TooltipTrigger asChild>
                        <DraggableComponentButton component={component} />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[200px]">
                        <div>
                          <p className="font-semibold">{component.name}</p>
                          <p className="text-xs opacity-90">
                            {component.description}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </TooltipProvider>
        </div>
      </ScrollArea>
    </div>
  );
}
