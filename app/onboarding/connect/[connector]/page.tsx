"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { ArrowRight, ArrowLeft, Database } from "lucide-react";
import { toast } from "sonner";

const connectionSchema = z.object({
  host: z.string().min(1, "Host is required"),
  port: z.string().optional(),
  database: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type ConnectionFormValues = z.infer<typeof connectionSchema>;

export default function ConnectPage() {
  const router = useRouter();
  const params = useParams();
  const connector = params.connector as string;
  const { updateOnboarding, setOnboardingStep, addDataSource, completeOnboarding, currentOrganization } = useWorkspaceStore();
  const [loading, setLoading] = useState(false);

  const handleSkip = () => {
    completeOnboarding();
    router.push("/workspace");
  };

  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      host: "",
      port: "",
      database: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: ConnectionFormValues) => {
    setLoading(true);
    try {
      // In a real app, this would call an API to test the connection
      const dataSource = {
        id: `ds_${Date.now()}`,
        name: `${connector} Connection`,
        type: connector as any,
        status: "connected" as const,
        organizationId: currentOrganization?.id,
        connectedAt: new Date().toISOString(),
      };

      addDataSource(dataSource);
      updateOnboarding({ dataSourceId: dataSource.id });
      toast.success("Connection successful!");
      router.push(`/onboarding/connect/${connector}/select`);
    } catch (error) {
      toast.error("Failed to connect. Please check your credentials.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = () => {
    // For OAuth connectors like Google Sheets
    toast.info("Redirecting to OAuth...");
    // In a real app, this would redirect to OAuth flow
    setTimeout(() => {
      const dataSource = {
        id: `ds_${Date.now()}`,
        name: `${connector} Connection`,
        type: connector as any,
        status: "connected" as const,
        organizationId: currentOrganization?.id,
        connectedAt: new Date().toISOString(),
      };
      addDataSource(dataSource);
      updateOnboarding({ dataSourceId: dataSource.id });
      router.push(`/onboarding/connect/${connector}/select`);
    }, 1000);
  };

  const isOAuthConnector = ["google-sheets"].includes(connector);
  const isFileUpload = ["excel", "csv"].includes(connector);

  if (isOAuthConnector) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Connect {connector === "google-sheets" ? "Google Sheets" : connector}</CardTitle>
                  <CardDescription>Step 2 of 3 - Authenticate with your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  Click the button below to authenticate with your Google account and grant access to your sheets.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/onboarding/data-source")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={loading}
                  >
                    Skip for now
                  </Button>
                  <Button onClick={handleOAuth} disabled={loading}>
                    Connect with Google
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isFileUpload) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Upload {connector === "excel" ? "Excel" : "CSV"} File</CardTitle>
                  <CardDescription>Step 2 of 3 - Upload your data file</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  Upload your {connector === "excel" ? "Excel" : "CSV"} file to get started.
                </p>
                <Input
                  type="file"
                  accept={connector === "excel" ? ".xlsx,.xls" : ".csv"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const dataSource = {
                        id: `ds_${Date.now()}`,
                        name: file.name,
                        type: connector as any,
                        status: "connected" as const,
                        connectedAt: new Date().toISOString(),
                      };
                      addDataSource(dataSource);
                      updateOnboarding({ dataSourceId: dataSource.id });
                      toast.success("File uploaded successfully!");
                      router.push(`/onboarding/connect/${connector}/select`);
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/onboarding/data-source")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                >
                  Skip for now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Connect {connector}</CardTitle>
                <CardDescription>Step 2 of 3 - Enter your connection details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="localhost" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="5432" type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="database"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="mydb" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="user" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="••••••••" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/onboarding/data-source")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleSkip}
                      disabled={loading}
                    >
                      Skip for now
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Connecting..." : "Connect"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

