"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Activity,
  AreaChart,
  ArrowRight,
  BarChart2,
  BarChart3,
  Calendar,
  ChevronsDown,
  Circle,
  CircleDot,
  Code,
  Download,
  Edit,
  Eye,
  FileBarChart,
  FileText,
  Filter,
  Flame,
  FolderTree,
  Gauge,
  GitBranch,
  Globe,
  Grid3x3,
  HelpCircle,
  Layers,
  LayoutGrid,
  LineChart,
  LineChart as LineChartIcon,
  Map as MapIcon,
  MapPin,
  MessageSquare,
  PieChart,
  QrCode,
  Radio,
  RefreshCw,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  SquareStack,
  Table,
  Target,
  ThumbsUp,
  TrendingUp,
  X,
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

// All @bi components with their icons and descriptions
const allComponents = [
  // Charts
  {
    id: "line-chart",
    name: "Line Chart",
    icon: LineChartIcon,
    description: "Time series visualization",
  },
  {
    id: "bar-chart",
    name: "Bar Chart",
    icon: BarChart3,
    description: "Comparison view",
  },
  {
    id: "area-chart",
    name: "Area Chart",
    icon: AreaChart,
    description: "Cumulative trends",
  },
  {
    id: "pie-chart",
    name: "Pie Chart",
    icon: PieChart,
    description: "Part-to-whole visualization",
  },
  {
    id: "donut-chart",
    name: "Donut Chart",
    icon: CircleDot,
    description: "Donut-style pie chart",
  },
  {
    id: "stacked-bar-chart",
    name: "Stacked Bar Chart",
    icon: BarChart2,
    description: "Stacked horizontal bars",
  },
  {
    id: "stacked-column-chart",
    name: "Stacked Column Chart",
    icon: BarChart3,
    description: "Stacked vertical bars",
  },
  {
    id: "clustered-bar-chart",
    name: "Clustered Bar Chart",
    icon: BarChart2,
    description: "Grouped horizontal bars",
  },
  {
    id: "clustered-column-chart",
    name: "Clustered Column Chart",
    icon: BarChart3,
    description: "Grouped vertical bars",
  },
  {
    id: "stacked-area-chart",
    name: "Stacked Area Chart",
    icon: AreaChart,
    description: "Stacked area visualization",
  },
  {
    id: "line-stacked-column-chart",
    name: "Line Stacked Column",
    icon: LineChart,
    description: "Combination chart",
  },
  {
    id: "ribbon-chart",
    name: "Ribbon Chart",
    icon: Layers,
    description: "Ribbon-style area chart",
  },
  {
    id: "waterfall-chart",
    name: "Waterfall Chart",
    icon: SquareStack,
    description: "Waterfall visualization",
  },
  {
    id: "scatter-chart",
    name: "Scatter Chart",
    icon: Circle,
    description: "Correlation analysis",
  },
  {
    id: "radar-chart",
    name: "Radar Chart",
    icon: Radio,
    description: "Multi-dimension comparison",
  },
  {
    id: "funnel-chart",
    name: "Funnel Chart",
    icon: ChevronsDown,
    description: "Funnel visualization",
  },
  {
    id: "heatmap",
    name: "Heatmap",
    icon: Flame,
    description: "Heat map visualization",
  },
  {
    id: "treemap",
    name: "TreeMap",
    icon: FolderTree,
    description: "Hierarchical data",
  },
  {
    id: "sankey-diagram",
    name: "Sankey Diagram",
    icon: GitBranch,
    description: "Flow visualization",
  },
  {
    id: "forecast-line",
    name: "Forecast Line",
    icon: TrendingUp,
    description: "Forecast visualization",
  },

  // Metrics
  {
    id: "kpi-card",
    name: "KPI Card",
    icon: TrendingUp,
    description: "Key performance indicator",
  },
  {
    id: "metric-card",
    name: "Metric Card",
    icon: Activity,
    description: "Big number display",
  },
  {
    id: "gauge",
    name: "Gauge",
    icon: Gauge,
    description: "Progress indicator",
  },
  {
    id: "bullet-chart",
    name: "Bullet Chart",
    icon: Target,
    description: "Target vs actual",
  },
  {
    id: "sparkline",
    name: "Sparkline",
    icon: LineChartIcon,
    description: "Inline mini-chart",
  },
  {
    id: "progress-bar",
    name: "Progress Bar",
    icon: Activity,
    description: "Progress visualization",
  },
  {
    id: "multi-row-card",
    name: "Multi Row Card",
    icon: FileText,
    description: "Multi-row metric card",
  },

  // Data Display
  {
    id: "data-table",
    name: "Data Table",
    icon: Table,
    description: "Sortable data grid",
  },
  {
    id: "matrix",
    name: "Matrix",
    icon: Grid3x3,
    description: "Pivot table view",
  },
  {
    id: "paginated-report",
    name: "Paginated Report",
    icon: FileBarChart,
    description: "Paginated report view",
  },

  // Maps
  {
    id: "map",
    name: "Map",
    icon: MapIcon,
    description: "Geographic visualization",
  },
  {
    id: "filled-map",
    name: "Filled Map",
    icon: MapPin,
    description: "Choropleth map",
  },
  {
    id: "basic-leaflet-map",
    name: "Basic Leaflet Map",
    icon: Globe,
    description: "Basic map with Leaflet",
  },
  {
    id: "leaflet-map-with-pin",
    name: "Leaflet Map with Pin",
    icon: MapPin,
    description: "Map with location pin",
  },
  {
    id: "leaflet-map-grayscale",
    name: "Leaflet Map Grayscale",
    icon: MapIcon,
    description: "Grayscale map",
  },
  {
    id: "leaflet-map-custom-pin",
    name: "Leaflet Map Custom Pin",
    icon: MapPin,
    description: "Map with custom pin",
  },
  {
    id: "leaflet-map-custom-popover",
    name: "Leaflet Map Popover",
    icon: MapPin,
    description: "Map with popover",
  },
  {
    id: "leaflet-map-change-city",
    name: "Leaflet Map City",
    icon: Globe,
    description: "City map",
  },
  {
    id: "leaflet-map-bubbles",
    name: "Leaflet Map Bubbles",
    icon: Globe,
    description: "Bubble map",
  },

  // Layout & Container
  {
    id: "grid-layout",
    name: "Grid Layout",
    icon: LayoutGrid,
    description: "Grid container",
  },
  {
    id: "section",
    name: "Section",
    icon: Layers,
    description: "Section container",
  },

  // Input & Filter
  {
    id: "date-range-picker",
    name: "Date Range Picker",
    icon: Calendar,
    description: "Date range selection",
  },
  {
    id: "multi-select",
    name: "Multi Select",
    icon: Filter,
    description: "Multi-select dropdown",
  },
  {
    id: "search-input",
    name: "Search Input",
    icon: Search,
    description: "Search input field",
  },
  {
    id: "slicer",
    name: "Slicer",
    icon: SlidersHorizontal,
    description: "Data slicer/filter",
  },

  // Text & Insight
  {
    id: "insight-text",
    name: "Insight Text",
    icon: Sparkles,
    description: "AI insight text",
  },
  {
    id: "ai-commentary",
    name: "AI Commentary",
    icon: MessageSquare,
    description: "AI analysis commentary",
  },
  {
    id: "stat-change",
    name: "Stat Change",
    icon: TrendingUp,
    description: "Delta indicator",
  },
  {
    id: "trend-label",
    name: "Trend Label",
    icon: ArrowRight,
    description: "Trend tag",
  },
  {
    id: "anomaly-badge",
    name: "Anomaly Badge",
    icon: Eye,
    description: "Outlier indicator",
  },

  // Embed & Share
  {
    id: "embed-code",
    name: "Embed Code",
    icon: Code,
    description: "Embed code generator",
  },
  {
    id: "share-button",
    name: "Share Button",
    icon: Share2,
    description: "Share functionality",
  },
  {
    id: "qr-code",
    name: "QR Code",
    icon: QrCode,
    description: "QR code generator",
  },
  {
    id: "export-pdf",
    name: "Export PDF",
    icon: Download,
    description: "PDF export",
  },

  // AI Prompt & Feedback
  {
    id: "prompt-input",
    name: "Prompt Input",
    icon: Sparkles,
    description: "AI prompt interface",
  },
  {
    id: "regenerate-button",
    name: "Regenerate Button",
    icon: RefreshCw,
    description: "Regenerate content",
  },
  {
    id: "feedback-thumbs",
    name: "Feedback Thumbs",
    icon: ThumbsUp,
    description: "Like/dislike feedback",
  },
  {
    id: "edit-prompt",
    name: "Edit Prompt",
    icon: Edit,
    description: "Edit and resubmit",
  },
  {
    id: "qa",
    name: "Q&A",
    icon: HelpCircle,
    description: "Question and answer",
  },
];

interface DraggableComponentButtonProps {
  component: (typeof allComponents)[number];
}

function DraggableComponentButton({
  component,
}: DraggableComponentButtonProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${component.id}`,
      data: {
        type: "palette",
        componentType: component.id,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  const Icon = component.icon;

  return (
    <Button
      ref={setNodeRef}
      variant="ghost"
      size="icon"
      className={cn(
        "h-10 w-10 cursor-grab active:cursor-grabbing touch-none transition-all",
        "hover:bg-blue-500/20 hover:border-blue-500 hover:border",
        "active:bg-blue-500/30 active:border-blue-600",
        isDragging && "bg-blue-500/30 border-blue-600 border-2",
      )}
      style={style}
      {...attributes}
      {...listeners}
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
        <div className="p-4">
          <TooltipProvider delayDuration={200}>
            <div className="grid grid-cols-4 gap-2">
              {allComponents.map((component) => {
                return (
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
                );
              })}
            </div>
          </TooltipProvider>
        </div>
      </ScrollArea>
    </div>
  );
}
