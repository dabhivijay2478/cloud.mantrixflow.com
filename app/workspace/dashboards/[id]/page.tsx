"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { DashboardCanvasWithHandlers } from "@/components/workspace/dashboard-canvas";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { DashboardComponent } from "@/lib/stores/workspace-store";

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
  } = useWorkspaceStore();
  const [dashboard, setDashboard] = useState(currentDashboard);

  useEffect(() => {
    const found = dashboards.find((d) => d.id === dashboardId);
    if (found) {
      setCurrentDashboard(found);
      setDashboard(found);
    } else {
      toast.error("Dashboard not found");
      router.push("/workspace/dashboards");
    }
  }, [dashboardId, dashboards, setCurrentDashboard, router]);

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
    <div className="space-y-2 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 shrink-0 pb-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/workspace")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold truncate">{dashboard.name}</h1>
            {dashboard.description && (
              <p className="text-muted-foreground text-xs sm:text-sm truncate">
                {dashboard.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-initial"
            onClick={() =>
              window.open(
                `/workspace/dashboards/${dashboard.id}/view`,
                "_blank",
              )
            }
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">View</span>
            <span className="sm:hidden">View</span>
          </Button>
          <Button onClick={handleSave} size="sm" className="flex-1 sm:flex-initial">
            <Save className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      <div className="border flex-1 min-h-0 overflow-hidden rounded-lg">
        <DashboardCanvasWithHandlers
          components={dashboard.components}
          onComponentsChange={handleComponentsChange}
          onComponentUpdate={handleComponentUpdate}
          onComponentDelete={handleComponentDelete}
          className="h-full"
        />
      </div>
    </div>
  );
}
