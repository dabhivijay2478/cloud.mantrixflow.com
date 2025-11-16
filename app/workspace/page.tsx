"use client";

import { ExternalLink, FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState, PageHeader, Timestamp } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export default function WorkspacePage() {
  const router = useRouter();
  const { dashboards, dataSources, currentOrganization, setCurrentDashboard } =
    useWorkspaceStore();

  // Filter dashboards by current organization
  const filteredDashboards = currentOrganization
    ? dashboards.filter(
        (dashboard) => dashboard.organizationId === currentOrganization.id,
      )
    : [];

  const handleCreateDashboard = () => {
    router.push("/workspace/dashboards");
  };

  const handleOpenDashboard = (dashboardId: string) => {
    const dashboard = filteredDashboards.find((d) => d.id === dashboardId);
    if (dashboard) {
      setCurrentDashboard(dashboard);
      router.push(`/workspace/dashboards/${dashboardId}`);
    }
  };

  if (filteredDashboards.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Welcome to Your Workspace"
        description={
          currentOrganization
            ? `Get started by creating your first dashboard for ${currentOrganization.name}`
            : "Get started by creating your first dashboard"
        }
        actionLabel="Create Your First Dashboard"
        onAction={handleCreateDashboard}
      >
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dashboards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {filteredDashboards.length}
              </div>
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
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          currentOrganization
            ? `Manage your dashboards for ${currentOrganization.name}`
            : "Manage your dashboards"
        }
        action={
          <Button onClick={handleCreateDashboard}>
            <Plus className="mr-2 h-4 w-4" />
            New Dashboard
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDashboards.map((dashboard) => (
          <Card
            key={dashboard.id}
            className="group relative cursor-pointer overflow-hidden border transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => handleOpenDashboard(dashboard.id)}
          >
            {/* External Link Icon - Top Right Corner */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDashboard(dashboard.id);
              }}
              aria-label="Open dashboard"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 pr-8 text-lg font-semibold">
                <FileText className="h-5 w-5 text-primary" />
                {dashboard.name}
              </CardTitle>
              {dashboard.description && (
                <CardDescription className="line-clamp-2 mt-1">
                  {dashboard.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Created:</span>
                  <Timestamp date={dashboard.createdAt || ""} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Updated:</span>
                  <Timestamp date={dashboard.updatedAt || ""} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
