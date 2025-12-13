"use client";

import {
  ArrowRightLeft,
  Database,
  Plus,
  Settings,
  Sparkles,
  Trash2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Pipeline } from "@/lib/stores/workspace-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";

type PipelineType = "bulk" | "stream" | "emit";

export default function DataPipelinesPage() {
  const { currentOrganization, dataSources, pipelines, removePipeline } =
    useWorkspaceStore();
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

  const handleDelete = (pipelineId: string, pipelineName: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${pipelineName}"? This action cannot be undone.`,
      )
    ) {
      removePipeline(pipelineId);
      toast.success(
        "Pipeline deleted",
        `${pipelineName} has been deleted successfully.`,
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

      {/* Existing Pipelines */}
      {pipelines.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Pipelines</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Destinations</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[200px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pipelines.map((pipeline) => {
                      const typeInfo = getPipelineTypeInfo(pipeline.type);
                      const Icon = typeInfo.icon;
                      const source = dataSources.find(
                        (ds) => ds.id === pipeline.sourceId,
                      );

                      return (
                        <TableRow key={pipeline.id}>
                          <TableCell className="font-medium">
                            {pipeline.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-8 w-8 rounded-lg ${typeInfo.bgColor} flex items-center justify-center`}
                              >
                                <Icon className={`h-4 w-4 ${typeInfo.color}`} />
                              </div>
                              <span className="text-sm">{typeInfo.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {source?.name || "Unknown source"}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(pipeline.status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {pipeline.destinationIds.length} destination
                            {pipeline.destinationIds.length !== 1 ? "s" : ""}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(pipeline.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() =>
                                  handleDelete(pipeline.id, pipeline.name)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
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
