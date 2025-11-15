"use client";

import { ArrowLeft, Database, ExternalLink, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ComponentsPanel } from "@/components/workspace/components-panel";
import { DashboardCanvasWithHandlers } from "@/components/workspace/dashboard-canvas";
import { PropertiesPanel } from "@/components/workspace/properties-panel";
import { DashboardDndProvider } from "@/components/workspace/dashboard-dnd-provider";
import type { DashboardComponent } from "@/lib/stores/workspace-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export default function DashboardEditorPage() {
  const router = useRouter();
  const params = useParams();
  const dashboardId = params.id as string;
  const {
    dashboards,
    currentDashboard,
    setCurrentDashboard,
    updateDashboard,
    updateDashboardComponent,
    removeDashboardComponent,
    datasets,
  } = useWorkspaceStore();
  const [dashboard, setDashboard] = useState(currentDashboard);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null,
  );
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const found = dashboards.find((d) => d.id === dashboardId);
    if (found) {
      setCurrentDashboard(found);
      setDashboard(found);
      // Load dataset if dashboard has one configured
      if (found.dataSourceId) {
        const dataset = datasets.find(
          (ds) => ds.dataSourceId === found.dataSourceId,
        );
        if (dataset) {
          setSelectedDatasetId(dataset.id);
        }
      }
    } else {
      toast.error("Dashboard not found");
      router.push("/workspace/dashboards");
    }
  }, [dashboardId, dashboards, setCurrentDashboard, router, datasets]);

  const handleComponentsChange = useCallback(
    (components: DashboardComponent[]) => {
      if (dashboard) {
        updateDashboard(dashboard.id, {
          ...dashboard,
          components,
          updatedAt: new Date().toISOString(),
        });
        setDashboard({ ...dashboard, components });
      }
    },
    [dashboard, updateDashboard],
  );

  const handleComponentUpdate = useCallback(
    (id: string, updates: Partial<DashboardComponent>) => {
      if (dashboard) {
        updateDashboardComponent(dashboard.id, id, updates);
        setDashboard({
          ...dashboard,
          components: dashboard.components.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        });
      }
    },
    [dashboard, updateDashboardComponent],
  );

  const handleComponentSelect = useCallback((id: string | null) => {
    setSelectedComponentId(id);
  }, []);

  const selectedComponent = dashboard?.components.find(
    (c) => c.id === selectedComponentId,
  ) || null;

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId) || null;

  const handleComponentDelete = useCallback(
    (id: string) => {
      if (dashboard) {
        removeDashboardComponent(dashboard.id, id);
        setDashboard({
          ...dashboard,
          components: dashboard.components.filter((c) => c.id !== id),
        });
        toast.success("Component removed");
      }
    },
    [dashboard, removeDashboardComponent],
  );

  const handleSave = () => {
    if (dashboard) {
      updateDashboard(dashboard.id, {
        ...dashboard,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Dashboard saved successfully");
    }
  };

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardDndProvider>
      <div className="h-screen flex flex-col bg-background">
        {/* Top Header Bar */}
        <div className="border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/workspace")}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold truncate">
                  {dashboard.name}
                </h1>
                {dashboard.description && (
                  <p className="text-muted-foreground text-xs truncate">
                    {dashboard.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedDatasetId || ""}
                  onValueChange={(value) => {
                    setSelectedDatasetId(value);
                    if (dashboard) {
                      const dataset = datasets.find((d) => d.id === value);
                      if (dataset) {
                        updateDashboard(dashboard.id, {
                          dataSourceId: dataset.dataSourceId,
                        });
                      }
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No datasets available
                      </div>
                    ) : (
                      datasets.map((dataset) => (
                        <SelectItem key={dataset.id} value={dataset.id}>
                          {dataset.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `/workspace/dashboards/${dashboard.id}/view`,
                    "_blank",
                  )
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Components Panel */}
            <ResizablePanel
              defaultSize={15}
              minSize={10}
              maxSize={25}
              collapsible
              className="border-r"
            >
              <ComponentsPanel />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Canvas Area */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <div className="h-full border-r">
                <DashboardCanvasWithHandlers
                  components={dashboard.components}
                  onComponentsChange={handleComponentsChange}
                  onComponentUpdate={handleComponentUpdate}
                  onComponentDelete={handleComponentDelete}
                  onComponentSelect={handleComponentSelect}
                  selectedComponentId={selectedComponentId}
                  className="h-full"
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Properties Panel */}
            <ResizablePanel
              defaultSize={25}
              minSize={20}
              maxSize={40}
              collapsible
            >
              <PropertiesPanel
                component={selectedComponent}
                dataset={selectedDataset}
                onUpdate={(updates) => {
                  if (selectedComponentId) {
                    handleComponentUpdate(selectedComponentId, updates);
                  }
                }}
                onClose={() => setSelectedComponentId(null)}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </DashboardDndProvider>
  );
}
