"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardCanvasWithHandlers } from "@/components/workspace/dashboard-canvas";
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
    setSelectedComponentId: setGlobalSelectedComponentId,
    selectedComponentId: globalSelectedComponentId,
    setSelectedDatasetId: setGlobalSelectedDatasetId,
  } = useWorkspaceStore();
  const [dashboard, setDashboard] = useState(currentDashboard);

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
          setGlobalSelectedDatasetId(dataset.id);
        }
      }
    } else {
      toast.error("Dashboard not found");
      router.push("/workspace/dashboards");
    }
  }, [
    dashboardId,
    dashboards,
    setCurrentDashboard,
    router,
    datasets,
    setGlobalSelectedDatasetId,
  ]);

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

  const handleComponentSelect = useCallback(
    (id: string | null) => {
      setGlobalSelectedComponentId(id);
    },
    [setGlobalSelectedComponentId],
  );

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
      <div className="h-full flex flex-col bg-background">
        {/* Canvas Area */}
        <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
          <DashboardCanvasWithHandlers
            components={dashboard.components}
            onComponentsChange={handleComponentsChange}
            onComponentUpdate={handleComponentUpdate}
            onComponentDelete={handleComponentDelete}
            onComponentSelect={handleComponentSelect}
            selectedComponentId={globalSelectedComponentId}
            className="h-full"
          />
        </div>
      </div>
    </DashboardDndProvider>
  );
}
