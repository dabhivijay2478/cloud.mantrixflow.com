"use client";

import { ArrowRightLeft, Database, GitBranch, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export default function DataPipelinesPage() {
  const { currentOrganization } = useWorkspaceStore();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Pipelines"
        description={
          currentOrganization
            ? `Manage data transfers from source to destination for ${currentOrganization.name}`
            : "Manage data transfers from source to destination"
        }
      />

      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <GitBranch className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Coming Soon</CardTitle>
            <CardDescription className="text-base mt-2">
              Data Pipelines feature is under development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                This feature will allow you to create and manage data pipelines
                that transfer data from source systems to destination systems,
                enabling seamless data flow across your organization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Source Systems</h3>
                <p className="text-xs text-muted-foreground">
                  Connect to various data sources
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                  <ArrowRightLeft className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">
                  Data Transformation
                </h3>
                <p className="text-xs text-muted-foreground">
                  Transform and process data in transit
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">
                  Destination Systems
                </h3>
                <p className="text-xs text-muted-foreground">
                  Deliver data to target systems
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-dashed">
              <p className="text-sm text-center text-muted-foreground">
                We're working hard to bring you this feature. Check back soon!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
