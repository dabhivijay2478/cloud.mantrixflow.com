"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { Plus, FileText, Database, ArrowRight, ExternalLink } from "lucide-react";
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
        {dashboards.map((dashboard) => (
          <Card
            key={dashboard.id}
            className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden group relative"
            onClick={() => handleOpenDashboard(dashboard.id)}
          >
            {/* External Link Icon - Top Right Corner */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDashboard(dashboard.id);
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            <CardHeader>
              <CardTitle className="flex items-center gap-2 pr-8">
                <FileText className="h-5 w-5" />
                {dashboard.name}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {dashboard.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Created:</span>
                  <span>
                    {dashboard.createdAt
                      ? new Date(dashboard.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Updated:</span>
                  <span>
                    {dashboard.updatedAt
                      ? new Date(dashboard.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

