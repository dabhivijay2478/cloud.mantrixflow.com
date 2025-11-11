"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import {
  LineChart as LineChartIcon,
  BarChart3,
  PieChart,
  Table,
  Gauge,
  Map,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Grid3x3,
  Layers,
  X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const componentCategories = [
  {
    name: "Charts",
    components: [
      { id: "line-chart", name: "Line Chart", icon: LineChartIcon, description: "Time series visualization" },
      { id: "bar-chart", name: "Bar Chart", icon: BarChart3, description: "Comparison view" },
      { id: "pie-chart", name: "Pie Chart", icon: PieChart, description: "Part-to-whole visualization" },
      { id: "area-chart", name: "Area Chart", icon: Layers, description: "Cumulative trends" },
      { id: "donut-chart", name: "Donut Chart", icon: PieChart, description: "Donut-style pie chart" },
      { id: "scatter-chart", name: "Scatter Chart", icon: Grid3x3, description: "Correlation analysis" },
    ],
  },
  {
    name: "Metrics",
    components: [
      { id: "kpi-card", name: "KPI Card", icon: TrendingUp, description: "Key performance indicator" },
      { id: "metric-card", name: "Metric Card", icon: Activity, description: "Big number display" },
      { id: "gauge", name: "Gauge", icon: Gauge, description: "Progress indicator" },
      { id: "sparkline", name: "Sparkline", icon: LineChartIcon, description: "Inline mini-chart" },
    ],
  },
  {
    name: "Data",
    components: [
      { id: "data-table", name: "Data Table", icon: Table, description: "Sortable data grid" },
      { id: "matrix", name: "Matrix", icon: Grid3x3, description: "Pivot table view" },
    ],
  },
  {
    name: "Maps",
    components: [
      { id: "map", name: "Map", icon: Map, description: "Geographic visualization" },
      { id: "filled-map", name: "Filled Map", icon: Map, description: "Choropleth map" },
    ],
  },
];

export function ComponentsPanel() {
  const { componentsPanelOpen, setComponentsPanelOpen } = useWorkspaceStore();

  if (!componentsPanelOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-0 top-1/2 -translate-y-1/2 z-10 rounded-r-lg rounded-l-none"
        onClick={() => setComponentsPanelOpen(true)}
      >
        <BarChart3 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-sm">Components</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setComponentsPanelOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {componentCategories.map((category) => (
            <div key={category.name}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                {category.name}
              </h3>
              <div className="space-y-1">
                {category.components.map((component) => {
                  const Icon = component.icon;
                  return (
                    <TooltipProvider key={component.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 h-auto py-2 px-2"
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("component-type", component.id);
                            }}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span className="text-xs text-left flex-1">{component.name}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{component.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

