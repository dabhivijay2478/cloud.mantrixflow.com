"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { Plus, Database, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const dashboardSchema = z.object({
  name: z.string().min(1, "Dashboard name is required").min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  dataSourceId: z.string().min(1, "Please select a data source"),
});

type DashboardFormValues = z.infer<typeof dashboardSchema>;

export default function DashboardsPage() {
  const router = useRouter();
  const { dashboards, addDashboard, setCurrentDashboard, currentOrganization, dataSources } = useWorkspaceStore();
  const [loading, setLoading] = useState(false);

  const form = useForm<DashboardFormValues>({
    resolver: zodResolver(dashboardSchema),
    defaultValues: {
      name: "",
      description: "",
      dataSourceId: "",
    },
  });

  const onSubmit = async (data: DashboardFormValues) => {
    setLoading(true);
    try {
      const dashboard = {
        id: `dash_${Date.now()}`,
        name: data.name,
        description: data.description,
        organizationId: currentOrganization?.id || "",
        dataSourceId: data.dataSourceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [],
      };

      addDashboard(dashboard);
      setCurrentDashboard(dashboard);
      toast.success("Dashboard created successfully");
      router.push(`/workspace/dashboards/${dashboard.id}`);
    } catch (error) {
      toast.error("Failed to create dashboard");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedDataSource = dataSources.find((ds) => ds.id === form.watch("dataSourceId"));
  const hasConnectedDataSources = dataSources.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Dashboard</h1>
          <p className="text-muted-foreground">Create a new dashboard for your data</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-2">
                    Dashboard Name
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Sales Performance Dashboard"
                      className="h-11 text-base"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a descriptive name that clearly identifies this dashboard
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Description
                    <span className="text-muted-foreground font-normal ml-2">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Track sales performance, monitor KPIs, and analyze trends..."
                      className="min-h-[100px] resize-none"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    Add context about what this dashboard will display and who it's for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataSourceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-2">
                    Data Source
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger className="h-11 text-base">
                        <SelectValue placeholder="Select a data source">
                          {selectedDataSource && (
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              <span>{selectedDataSource.name}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!hasConnectedDataSources ? (
                        <div className="p-6 text-center">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                            <AlertCircle className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium mb-1">No data sources available</p>
                          <p className="text-xs text-muted-foreground mb-4">
                            Connect a data source to create dashboards
                          </p>
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => router.push("/workspace/data-sources")}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Data Source
                          </Button>
                        </div>
                      ) : (
                        <div className="max-h-[300px] overflow-y-auto">
                          {dataSources.map((source) => (
                            <SelectItem key={source.id} value={source.id} className="py-3">
                              <div className="flex items-center gap-3 w-full">
                                <div className={cn(
                                  "h-8 w-8 rounded-md flex items-center justify-center shrink-0",
                                  source.status === "connected"
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                    : "bg-muted text-muted-foreground"
                                )}>
                                  <Database className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium truncate">{source.name}</span>
                                    {source.status === "connected" && (
                                      <Badge variant="outline" className="h-5 px-1.5 text-xs border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950">
                                        Connected
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground capitalize">{source.type}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the data source that will power this dashboard
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/workspace")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !hasConnectedDataSources}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Dashboard
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
