"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { ArrowLeft, Plus, Database, LayoutDashboard, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/workspace")}
            className="mb-4 sm:mb-6 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workspace
          </Button>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Create Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Build powerful visualizations and insights from your data sources
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-2 shadow-lg">
              <CardHeader className="pb-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Dashboard Details</CardTitle>
                    <CardDescription className="mt-1">
                      Configure your new dashboard settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                          "h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0",
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
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
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
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/workspace")}
                        disabled={loading}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading || !hasConnectedDataSources}
                        className="w-full sm:w-auto min-w-[160px]"
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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-6">
              {/* Quick Tips */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 dark:text-blue-400 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Choose a clear name</p>
                      <p className="text-xs text-muted-foreground">
                        Use descriptive names that make it easy to find your dashboard later
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-700 dark:text-green-400 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Connect data sources</p>
                      <p className="text-xs text-muted-foreground">
                        Make sure your data sources are connected before creating dashboards
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-700 dark:text-purple-400 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Add components</p>
                      <p className="text-xs text-muted-foreground">
                        After creation, drag and drop components from the panel to build your dashboard
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Data Source Preview */}
              {selectedDataSource && (
                <Card className="border-2 border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      Selected Source
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold mb-1">{selectedDataSource.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {selectedDataSource.type}
                        </Badge>
                      </div>
                      {selectedDataSource.status === "connected" ? (
                        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                          <AlertCircle className="h-4 w-4" />
                          <span>Not Connected</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Help Card */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <LayoutDashboard className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium mb-1">Need Help?</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Check out our documentation or contact support
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      View Documentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
