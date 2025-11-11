"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

const dashboardSchema = z.object({
  name: z.string().min(1, "Dashboard name is required").min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
});

type DashboardFormValues = z.infer<typeof dashboardSchema>;

export default function DashboardsPage() {
  const router = useRouter();
  const { dashboards, addDashboard, setCurrentDashboard, currentOrganization } = useWorkspaceStore();
  const [loading, setLoading] = useState(false);

  const form = useForm<DashboardFormValues>({
    resolver: zodResolver(dashboardSchema),
    defaultValues: {
      name: "",
      description: "",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/workspace")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Dashboard</h1>
          <p className="text-muted-foreground">Create a new dashboard for your data</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dashboard Details</CardTitle>
          <CardDescription>Enter the details for your new dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dashboard Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Sales Dashboard" />
                    </FormControl>
                    <FormDescription>
                      Choose a descriptive name for your dashboard
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Track sales performance and trends" />
                    </FormControl>
                    <FormDescription>
                      Add a description to help identify this dashboard
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/workspace")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  <Plus className="mr-2 h-4 w-4" />
                  {loading ? "Creating..." : "Create Dashboard"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

