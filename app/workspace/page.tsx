"use client";

import { Database, GitBranch } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState, PageHeader } from "@/components/shared";
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
  const { dataSources, currentOrganization } = useWorkspaceStore();

  // Filter data sources by current organization
  const filteredDataSources = currentOrganization
    ? dataSources.filter(
        (ds) =>
          !ds.organizationId || ds.organizationId === currentOrganization.id,
      )
    : dataSources.filter((ds) => !ds.organizationId);

  if (filteredDataSources.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title="Welcome to Your Workspace"
        description={
          currentOrganization
            ? `Get started by connecting your first data source for ${currentOrganization.name}`
            : "Get started by connecting your first data source"
        }
        actionLabel="Connect Data Source"
        onAction={() => router.push("/workspace/data-sources")}
      >
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dataSources.length}</div>
              <p className="text-sm text-muted-foreground">Connected sources</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Pipelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Active pipelines</p>
            </CardContent>
          </Card>
        </div>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace"
        description={
          currentOrganization
            ? `Manage your data sources and pipelines for ${currentOrganization.name}`
            : "Manage your data sources and pipelines"
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          className="group relative cursor-pointer overflow-hidden border transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => router.push("/workspace/data-sources")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Database className="h-5 w-5 text-primary" />
              Data Sources
            </CardTitle>
            <CardDescription>
              Connect and manage your data sources
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{filteredDataSources.length}</div>
            <p className="text-sm text-muted-foreground">Connected sources</p>
          </CardContent>
        </Card>

        <Card
          className="group relative cursor-pointer overflow-hidden border transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => router.push("/workspace/data-pipelines")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <GitBranch className="h-5 w-5 text-primary" />
              Data Pipelines
            </CardTitle>
            <CardDescription>
              Create and manage your data pipelines
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Active pipelines</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
