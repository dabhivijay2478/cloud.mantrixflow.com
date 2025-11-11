"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { GridLayout, GridItem } from "@/components/bi/grid-layout";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function DashboardEditorPage() {
  const router = useRouter();
  const params = useParams();
  const dashboardId = params.id as string;
  const { dashboards, currentDashboard, setCurrentDashboard, updateDashboard } = useWorkspaceStore();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
            Open in New Tab
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="min-h-[400px]">
            {dashboard.components.length === 0 ? (
              <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">Your dashboard is empty</p>
                  <p className="text-sm text-muted-foreground">
                    Drag components from the left panel or use the AI agent to generate components
                  </p>
                </div>
              </div>
            ) : (
              <GridLayout
                cols={12}
                rowHeight={60}
                onLayoutChange={(layout) => {
                  // Handle layout changes
                  console.log("Layout changed", layout);
                }}
              >
                {dashboard.components.map((component) => (
                  <GridItem
                    key={component.id}
                    i={component.id}
                    x={component.position.x}
                    y={component.position.y}
                    w={component.position.w}
                    h={component.position.h}
                  >
                    <Card className="h-full">
                      <CardContent className="p-4">
                        <div className="text-sm font-medium mb-2">{component.type}</div>
                        <div className="text-xs text-muted-foreground">
                          Component configuration goes here
                        </div>
                      </CardContent>
                    </Card>
                  </GridItem>
                ))}
              </GridLayout>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

