"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    [dashboard, updateDashboard]
  );

  const handleComponentUpdate = useCallback(
    (id: string, updates: Partial<DashboardComponent>) => {
      if (dashboard) {
        updateDashboardComponent(dashboard.id, id, updates);
        setDashboard({
          ...dashboard,
          components: dashboard.components.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        });
      }
    },
    [dashboard, updateDashboardComponent]
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
    [dashboard, removeDashboardComponent]
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
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/workspace")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{dashboard.name}</h1>
            {dashboard.description && (
              <p className="text-muted-foreground">{dashboard.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(`/workspace/dashboards/${dashboard.id}/view`, "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardContent className="p-6 flex-1 min-h-0">
          <DashboardCanvasWithHandlers
            components={dashboard.components}
            onComponentsChange={handleComponentsChange}
            onComponentUpdate={handleComponentUpdate}
            onComponentDelete={handleComponentDelete}
            className="h-full"
          />
        </CardContent>
      </Card>
    </div>
  );
}

