"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { Plus, FileText, Database, ArrowRight, TrendingUp, BarChart3, Activity, Table } from "lucide-react";
import { GridLayout, GridItem } from "@/components/bi/grid-layout";

export default function WorkspacePage() {
  const router = useRouter();
  const { dashboards, dataSources, currentOrganization, setCurrentDashboard } = useWorkspaceStore();

  const handleCreateDashboard = () => {
    router.push("/workspace/dashboards");
  };

  const handleOpenDashboard = (dashboardId: string) => {
    const dashboard = dashboards.find((d) => d.id === dashboardId);
    if (dashboard) {
      setCurrentDashboard(dashboard);
      router.push(`/workspace/dashboards/${dashboardId}`);
    }
  };

  if (dashboards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Your Workspace</CardTitle>
            <CardDescription>
              {currentOrganization
                ? `Get started by creating your first dashboard for ${currentOrganization.name}`
                : "Get started by creating your first dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleCreateDashboard} className="w-full" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Dashboard
            </Button>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dashboards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboards.length}</div>
                  <p className="text-sm text-muted-foreground">Total dashboards</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dataSources.length}</div>
                  <p className="text-sm text-muted-foreground">Connected sources</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {currentOrganization
              ? `Manage your dashboards for ${currentOrganization.name}`
              : "Manage your dashboards"}
          </p>
        </div>
        <Button onClick={handleCreateDashboard}>
          <Plus className="mr-2 h-4 w-4" />
          New Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboards.map((dashboard) => {
          // Get component icons
          const getComponentIcon = (type: string) => {
            if (type.includes("line") || type.includes("chart")) return TrendingUp;
            if (type.includes("bar")) return BarChart3;
            if (type.includes("kpi") || type.includes("metric")) return Activity;
            if (type.includes("table")) return Table;
            return FileText;
          };

          // Mock data for preview
          const previewData = [
            { x: "Jan", y: 40 },
            { x: "Feb", y: 30 },
            { x: "Mar", y: 50 },
            { x: "Apr", y: 35 },
          ];

          return (
            <Card
              key={dashboard.id}
              className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden group"
              onClick={() => handleOpenDashboard(dashboard.id)}
            >
              {/* Dashboard Preview with Name on Top */}
              <div className="relative w-full h-56 bg-gradient-to-br from-muted/50 to-muted/30 border-b overflow-hidden">
                {/* Dashboard Name Overlay */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm px-3 py-2 border-b">
                  <h3 className="font-semibold text-sm truncate">{dashboard.name}</h3>
                </div>

                {/* Component Previews */}
                {dashboard.components.length > 0 ? (
                  <div className="absolute inset-0 pt-10 p-3 grid grid-cols-2 gap-2">
                    {dashboard.components.slice(0, 4).map((component, idx) => {
                      const Icon = getComponentIcon(component.type);
                      return (
                        <div
                          key={component.id}
                          className="bg-background/90 rounded border shadow-sm p-2 overflow-hidden"
                          style={{
                            gridColumn: idx === 3 ? "span 2" : "span 1",
                          }}
                        >
                          {/* Component Preview */}
                          {component.type.includes("chart") && (
                            <div className="h-full flex flex-col">
                              <div className="flex items-center gap-1 mb-1">
                                <Icon className="h-3 w-3 text-primary" />
                                <span className="text-[10px] font-medium text-muted-foreground truncate">
                                  {component.type.replace("-", " ")}
                                </span>
                              </div>
                              <div className="flex-1 flex items-end gap-1">
                                {previewData.map((d, i) => (
                                  <div
                                    key={i}
                                    className="flex-1 bg-primary/30 rounded-t"
                                    style={{ height: `${d.y}%` }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          {(component.type.includes("kpi") || component.type.includes("metric")) && (
                            <div className="h-full flex flex-col justify-center">
                              <div className="flex items-center gap-1 mb-1">
                                <Icon className="h-3 w-3 text-primary" />
                                <span className="text-[10px] font-medium text-muted-foreground">
                                  {component.type.replace("-", " ")}
                                </span>
                              </div>
                              <div className="text-lg font-bold">$12.5K</div>
                              <div className="text-[10px] text-muted-foreground">+12.5%</div>
                            </div>
                          )}
                          {component.type.includes("table") && (
                            <div className="h-full flex flex-col">
                              <div className="flex items-center gap-1 mb-1">
                                <Icon className="h-3 w-3 text-primary" />
                                <span className="text-[10px] font-medium text-muted-foreground">
                                  {component.type.replace("-", " ")}
                                </span>
                              </div>
                              <div className="flex-1 space-y-1">
                                {[1, 2, 3].map((i) => (
                                  <div key={i} className="h-1 bg-muted rounded" />
                                ))}
                              </div>
                            </div>
                          )}
                          {!component.type.includes("chart") && !component.type.includes("kpi") && !component.type.includes("metric") && !component.type.includes("table") && (
                            <div className="h-full flex items-center justify-center">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {dashboard.components.length > 4 && (
                      <div className="bg-background/90 rounded border shadow-sm flex items-center justify-center">
                        <div className="text-xs font-medium text-muted-foreground">
                          +{dashboard.components.length - 4} more
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 pt-10 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                      <p className="text-xs text-muted-foreground">No components yet</p>
                    </div>
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <CardHeader>
                <CardDescription className="line-clamp-2">
                  {dashboard.description || "No description"}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

