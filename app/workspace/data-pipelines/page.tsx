"use client";

import {
  ArrowRightLeft,
  Database,
  Play,
  Plus,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Pipeline } from "@/lib/stores/workspace-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

type PipelineType = "bulk" | "stream" | "emit";

export default function DataPipelinesPage() {
  const { currentOrganization, dataSources, pipelines } = useWorkspaceStore();
  const router = useRouter();

  const getPipelineTypeInfo = (type: PipelineType) => {
    switch (type) {
      case "bulk":
        return {
          icon: Database,
          title: "Bulk Load",
          description: "One-time bulk imports from any system",
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
        };
      case "stream":
        return {
          icon: Zap,
          title: "Stream & Transform",
          description: "Real-time pipelines with rewind capability",
          color: "text-purple-600 dark:text-purple-400",
          bgColor: "bg-purple-100 dark:bg-purple-900/30",
        };
      case "emit":
        return {
          icon: Sparkles,
          title: "Emit Fearlessly",
          description: "Fan out to any destination",
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-900/30",
        };
    }
  };

  const getStatusBadge = (status: Pipeline["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
            Active
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Paused
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            Error
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Pipelines"
        description={
          currentOrganization
            ? `Connect any source to any destination for ${currentOrganization.name}`
            : "Connect any source to any destination"
        }
        action={
          <Button onClick={() => router.push("/workspace/data-pipelines/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Pipeline
          </Button>
        }
      />

      {/* Pipeline Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 hover:border-blue-500/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Bulk Load</CardTitle>
                <CardDescription className="text-xs">
                  One-time imports
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              One-time bulk imports from any system. We detect schemas
              automatically and start loading your data immediately.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Free</span>
              <Badge variant="outline">2 pipelines</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-purple-500/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Stream & Transform</CardTitle>
                <CardDescription className="text-xs">
                  Real-time pipelines
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Real-time pipelines with rewind capability. Stream continuously,
              transform on demand, replay from any point.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">$25 per GB/month</span>
              <Badge variant="outline">Unlimited</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-green-500/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Emit Fearlessly</CardTitle>
                <CardDescription className="text-xs">
                  Multi-destination
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Fan out to any destination—Snowflake, Pinecone, Redshift,
              wherever. No limits on endpoints.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Free</span>
              <Badge variant="outline">Unlimited</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Existing Pipelines */}
      {pipelines.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Pipelines</h2>
          <div className="grid grid-cols-1 gap-4">
            {pipelines.map((pipeline) => {
              const typeInfo = getPipelineTypeInfo(pipeline.type);
              const Icon = typeInfo.icon;
              const source = dataSources.find(
                (ds) => ds.id === pipeline.sourceId,
              );

              return (
                <Card
                  key={pipeline.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`h-12 w-12 rounded-lg ${typeInfo.bgColor} flex items-center justify-center shrink-0`}
                        >
                          <Icon className={`h-6 w-6 ${typeInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">
                              {pipeline.name}
                            </CardTitle>
                            {getStatusBadge(pipeline.status)}
                          </div>
                          <CardDescription className="text-sm">
                            {typeInfo.title} •{" "}
                            {source?.name || "Unknown source"}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/workspace/data-pipelines/${pipeline.id}/edit`,
                            )
                          }
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button variant="default" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {pipeline.destinationIds.length} destination
                        {pipeline.destinationIds.length !== 1 ? "s" : ""}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>
                        Created{" "}
                        {new Date(pipeline.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ArrowRightLeft className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No pipelines yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              Create your first data pipeline to start moving data from source
              to destination. Configure transformations, set up real-time
              streaming, or bulk load your data.
            </p>
            <Button
              onClick={() => router.push("/workspace/data-pipelines/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Pipeline
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
