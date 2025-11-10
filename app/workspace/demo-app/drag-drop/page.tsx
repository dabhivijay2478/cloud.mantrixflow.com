"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import "react-resizable/css/styles.css";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Resizable } from "react-resizable";
import {
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  KPICard,
  MetricCard,
  Gauge,
  DonutChart,
  RadarChart,
  Heatmap,
  FunnelChart,
  BulletChart,
  Sparkline,
  StatChange,
  TrendLabel,
  AnomalyBadge,
  ProgressBar,
  DataTable,
} from "@/components/bi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GripVertical,
  X,
  Plus,
  Save,
  Download,
  Upload,
  Trash2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample data for charts
const sampleBarData = [
  { month: "Jan", value: 186 },
  { month: "Feb", value: 305 },
  { month: "Mar", value: 237 },
  { month: "Apr", value: 273 },
  { month: "May", value: 209 },
  { month: "Jun", value: 214 },
];

const sampleLineData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

const sampleAreaData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

const samplePieData = [
  { name: "Desktop", value: 400, fill: "var(--chart-1)" },
  { name: "Mobile", value: 300, fill: "var(--chart-2)" },
  { name: "Tablet", value: 200, fill: "var(--chart-3)" },
  { name: "Other", value: 100, fill: "var(--chart-4)" },
];

// Component types available in the palette
const COMPONENT_PALETTE = [
  { id: "bar-chart", name: "Bar Chart", icon: "📊" },
  { id: "line-chart", name: "Line Chart", icon: "📈" },
  { id: "area-chart", name: "Area Chart", icon: "📉" },
  { id: "pie-chart", name: "Pie Chart", icon: "🥧" },
  { id: "kpi-card", name: "KPI Card", icon: "📊" },
  { id: "metric-card", name: "Metric Card", icon: "📈" },
  { id: "gauge", name: "Gauge", icon: "🎯" },
  { id: "donut-chart", name: "Donut Chart", icon: "🍩" },
  { id: "radar-chart", name: "Radar Chart", icon: "🕸️" },
  { id: "heatmap", name: "Heatmap", icon: "🔥" },
  { id: "funnel-chart", name: "Funnel Chart", icon: "🔽" },
  { id: "bullet-chart", name: "Bullet Chart", icon: "🔫" },
  { id: "sparkline", name: "Sparkline", icon: "⚡" },
  { id: "stat-change", name: "Stat Change", icon: "📊" },
  { id: "trend-label", name: "Trend Label", icon: "📈" },
  { id: "anomaly-badge", name: "Anomaly Badge", icon: "⚠️" },
  { id: "progress-bar", name: "Progress Bar", icon: "📊" },
  { id: "data-table", name: "Data Table", icon: "📋" },
];

interface DashboardItem {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data?: any;
}

interface DraggableItemProps {
  item: DashboardItem;
  onDelete: (id: string) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
}

function DraggableItem({ item, onDelete, onResize }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderComponent = () => {
    switch (item.type) {
      case "bar-chart":
        return <BarChart data={sampleBarData} xKey="month" yKeys={["value"]} />;
      case "line-chart":
        return (
          <LineChart
            data={sampleLineData}
            xKey="month"
            yKeys={["desktop", "mobile"]}
          />
        );
      case "area-chart":
        return (
          <AreaChart
            data={sampleAreaData}
            xKey="month"
            yKeys={["desktop", "mobile"]}
          />
        );
      case "pie-chart":
        return (
          <PieChart
            data={samplePieData}
            nameKey="name"
            valueKey="value"
          />
        );
      case "kpi-card":
        return (
          <KPICard
            value="$45,231"
            label="Total Revenue"
            change={+12.5}
            trend="up"
          />
        );
      case "metric-card":
        return (
          <MetricCard
            value="12,345"
            label="Active Users"
            description="Currently online"
          />
        );
      case "gauge":
        return <Gauge value={75} max={100} label="Progress" />;
      case "donut-chart":
        return (
          <DonutChart
            data={samplePieData}
            nameKey="name"
            valueKey="value"
          />
        );
      case "radar-chart":
        return (
          <RadarChart
            data={[
              { category: "A", value: 80 },
              { category: "B", value: 90 },
              { category: "C", value: 70 },
            ]}
            categoryKey="category"
            valueKeys={["value"]}
          />
        );
      case "heatmap":
        return (
          <Heatmap
            data={[
              { x: 0, y: 0, value: 10 },
              { x: 1, y: 0, value: 20 },
              { x: 0, y: 1, value: 15 },
              { x: 1, y: 1, value: 25 },
            ]}
            xLabels={["Mon", "Tue"]}
            yLabels={["Week 1", "Week 2"]}
          />
        );
      case "funnel-chart":
        return (
          <FunnelChart
            data={[
              { name: "Visits", value: 1000 },
              { name: "Leads", value: 500 },
              { name: "Sales", value: 100 },
            ]}
          />
        );
      case "bullet-chart":
        return (
          <BulletChart
            value={75}
            target={80}
            label="Revenue"
            zones={[
              { max: 50, color: "#fecaca" },
              { max: 70, color: "#fde68a" },
              { max: 100, color: "#bbf7d0" },
            ]}
          />
        );
      case "sparkline":
        return (
          <Sparkline
            data={[10, 20, 15, 30, 25, 40, 35]}
            color="var(--chart-1)"
          />
        );
      case "stat-change":
        return <StatChange value={+12.5} label="Growth" />;
      case "trend-label":
        return <TrendLabel trend="up" label="Rising" />;
      case "anomaly-badge":
        return <AnomalyBadge severity="high" label="Anomaly Detected" />;
      case "progress-bar":
        return <ProgressBar value={65} label="Progress" />;
      case "data-table":
        return (
          <DataTable
            data={[
              { id: 1, name: "Item 1", value: 100 },
              { id: 2, name: "Item 2", value: 200 },
            ]}
            columns={[
              { accessorKey: "name", header: "Name" },
              { accessorKey: "value", header: "Value" },
            ]}
          />
        );
      default:
        return <div>Unknown component</div>;
    }
  };

  return (
    <Resizable
      width={item.width}
      height={item.height}
      onResize={(e, data) => {
        e.stopPropagation();
        onResize(item.id, {
          width: data.size.width,
          height: data.size.height,
        });
      }}
      onResizeStop={(e, data) => {
        e.stopPropagation();
        onResize(item.id, {
          width: data.size.width,
          height: data.size.height,
        });
      }}
      minConstraints={[200, 150]}
      maxConstraints={[800, 600]}
      handle={
        <div
          className="react-resizable-handle react-resizable-handle-se group/resize"
          onMouseDown={(e) => {
            // Stop drag and drop from interfering, but allow resize
            e.stopPropagation();
          }}
          title="Drag to resize"
        />
      }
    >
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "relative group bg-card border rounded-lg shadow-sm w-full h-full",
          isDragging && "z-50 opacity-50"
        )}
      >
        {/* Drag Handle - Always visible and functional */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing bg-background/90 backdrop-blur-sm rounded p-1.5 border shadow-sm hover:bg-background transition-colors touch-none"
          onMouseDown={(e) => {
            // Prevent resize handle from interfering
            e.stopPropagation();
          }}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 bg-background/90 backdrop-blur-sm border shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete(item.id);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <X className="w-3 h-3" />
        </Button>

        {/* Component Content */}
        <div className="p-4 h-full overflow-auto">
          {renderComponent()}
        </div>
      </div>
    </Resizable>
  );
}

function CanvasDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: "canvas-drop-zone",
  });

  return (
    <div ref={setNodeRef} className="min-h-full">
      {children}
    </div>
  );
}

function PaletteItem({ id, name, icon }: { id: string; name: string; icon: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${id}`,
    data: { type: "palette", componentType: id },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-2 p-3 bg-card border rounded-lg cursor-grab active:cursor-grabbing hover:bg-accent transition-colors touch-none"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}

export default function DragDropDemoPage() {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before activating drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    // Allow dropping palette items anywhere on canvas
    const activeData = active.data.current;
    if (activeData?.type === "palette" && over?.id === "canvas-drop-zone") {
      // This is handled in dragEnd
      return;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Check if dragging from palette
    const activeData = active.data.current;
    if (activeData?.type === "palette") {
      // Add new component to canvas if dropped on canvas or any existing item
      if (over && (over.id === "canvas-drop-zone" || items.some(item => item.id === over.id))) {
        const newItem: DashboardItem = {
          id: `item-${Date.now()}`,
          type: activeData.componentType,
          x: 0,
          y: items.length * 200,
          width: 400,
          height: 300,
        };
        setItems([...items, newItem]);
      }
    } else {
      // Reorder existing items
      if (over && over.id !== active.id) {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          setItems(arrayMove(items, oldIndex, newIndex));
        }
      }
    }

    setActiveId(null);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleResize = (id: string, size: { width: number; height: number }) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, width: size.width, height: size.height } : item
      )
    );
  };

  const handleSave = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard-layout.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const loadedItems = JSON.parse(event.target?.result as string);
            setItems(loadedItems);
          } catch (error) {
            console.error("Failed to load layout:", error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all components?")) {
      setItems([]);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-background">
        {/* Component Palette Sidebar */}
        <div
          className={cn(
            "border-r bg-card transition-all duration-300 overflow-y-auto",
            isPaletteOpen ? "w-64" : "w-0 overflow-hidden"
          )}
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Components</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              >
                {isPaletteOpen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
            <div className="space-y-2">
              {COMPONENT_PALETTE.map((component) => (
                <PaletteItem
                  key={component.id}
                  id={component.id}
                  name={component.name}
                  icon={component.icon}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border-b bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Drag & Drop Dashboard Builder</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Layout
              </Button>
              <Button variant="outline" size="sm" onClick={handleLoad}>
                <Upload className="w-4 h-4 mr-2" />
                Load Layout
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              >
                {isPaletteOpen ? "Hide" : "Show"} Palette
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto p-4 bg-muted/30">
            <CanvasDropZone>
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
                  {items.map((item) => (
                    <DraggableItem
                      key={item.id}
                      item={item}
                      onDelete={handleDelete}
                      onResize={handleResize}
                    />
                  ))}
                </div>
              </SortableContext>
            </CanvasDropZone>

            {items.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <Card className="p-8 text-center">
                  <CardContent className="space-y-4">
                    <p className="text-lg text-muted-foreground">
                      Drag components from the palette to get started
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsPaletteOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Open Component Palette
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="bg-card border rounded-lg shadow-lg p-4 w-64 h-48 opacity-90">
            <p className="text-sm text-muted-foreground">Dragging...</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

