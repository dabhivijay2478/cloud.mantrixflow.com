"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Database, Eye, EyeOff } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/lib/utils/toast";
import { z } from "zod";
import { buildConnectionSchemasFromMetadata } from "@/components/data-sources/connector-metadata-utils";
import type { ConnectionSchema } from "@/components/data-sources/connector-metadata-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConnectorMetadata } from "@/lib/api/hooks/use-connector-metadata";
import { useCreateConnection } from "@/lib/api";
import type { CreateConnectionDto } from "@/lib/api";
import {
  type DataSource,
  useWorkspaceStore,
} from "@/lib/stores/workspace-store";

type ConnectionFormValues = Record<string, string>;

// Dynamic schema builder for validation (matches ConnectionSheet)
function buildConnectionSchema(
  schema: ConnectionSchema | null | undefined,
  formValues: ConnectionFormValues,
) {
  if (!schema) {
    return z.object({}).passthrough();
  }
  const schemaObject: Record<string, z.ZodTypeAny> = {};
  schema.fields.forEach((field) => {
    let isVisible = true;
    if (field.dependsOn) {
      const dependencyValue = formValues[field.dependsOn.field];
      isVisible = String(dependencyValue) === String(field.dependsOn.value);
    }
    if (field.required && isVisible) {
      schemaObject[field.name] = z
        .string()
        .min(1, `${field.label} is required`);
    } else {
      schemaObject[field.name] = z.string().optional();
    }
  });
  return z.object(schemaObject);
}

export default function ConnectPage() {
  const router = useRouter();
  const params = useParams();
  const connector = params.connector as string;
  const {
    updateOnboarding,
    addDataSource,
    completeOnboarding,
    currentOrganization,
  } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;
  const createConnection = useCreateConnection(organizationId);
  const [loading, setLoading] = useState(false);
  const [visiblePasswordFields, setVisiblePasswordFields] = useState<
    Record<string, boolean>
  >({});

  const { data: connectorMetadata } = useConnectorMetadata();
  const connectionSchemasOverride = useMemo(
    () =>
      connectorMetadata
        ? buildConnectionSchemasFromMetadata(connectorMetadata)
        : undefined,
    [connectorMetadata],
  );

  const schema = connectionSchemasOverride?.[connector];

  const getDefaultValues = useCallback(() => {
    if (!schema) return {};
    const defaults: Record<string, string> = {};
    schema.fields.forEach((field) => {
      const def = (field as { default?: unknown }).default;
      defaults[field.name] =
        def !== undefined && def !== null ? String(def) : "";
    });
    // Sync mode for database connectors (Phase 5: Full Sync vs CDC)
    if (["postgres", "mysql", "mongodb"].includes(connector)) {
      defaults["sync_mode"] = "full";
    }
    return defaults;
  }, [schema, connector]);

  const form = useForm<ConnectionFormValues>({
    // @ts-expect-error - Custom resolver with dynamic schema (matches ConnectionSheet)
    resolver: (values, _context, _options) => {
      if (!schema) {
        return { values: values as ConnectionFormValues, errors: {} };
      }
      const validationSchema = buildConnectionSchema(schema, values);
      const result = validationSchema.safeParse(values);
      if (result.success) {
        return { values: result.data as ConnectionFormValues, errors: {} };
      }
      const errors: Record<string, { message: string }> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path && typeof path === "string") {
          errors[path] = { message: issue.message };
        }
      });
      return { values: {} as ConnectionFormValues, errors };
    },
    defaultValues: getDefaultValues(),
  });

  const allValues = form.watch();

  useEffect(() => {
    if (schema && connector) {
      form.reset(getDefaultValues());
    }
  }, [connector, schema, form, getDefaultValues]);

  const handleSkip = () => {
    completeOnboarding();
    router.push("/workspace");
  };

  const onSubmit = async (data: ConnectionFormValues) => {
    if (!organizationId) {
      toast.error("No organization selected", "Please select an organization.");
      return;
    }
    setLoading(true);
    try {
      // Build config from form data (same pattern as data-sources handleConnect)
      const config: Record<string, unknown> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (key === "name") return;
        if (!value) return;
        if (key === "port") {
          config[key] = parseInt(value, 10);
        } else {
          config[key] = value;
        }
      });
      // Include sync_mode for database connectors
      if (["postgres", "mysql", "mongodb"].includes(connector)) {
        config.sync_mode = data.sync_mode || "full";
      }
      // MongoDB connection string handling
      if (connector === "mongodb") {
        if (data.useConnectionString === "false") {
          delete config.connection_string;
        } else if (data.useConnectionString === "true") {
          delete config.host;
          delete config.port;
          delete config.username;
          delete config.password;
          delete config.database;
        }
      }
      // SSL for database types
      if (["postgres", "mysql", "mongodb"].includes(connector)) {
        if (data.ssl === "true" || data.tls === "true") {
          if (connector !== "mongodb") config.ssl = { enabled: true };
        } else if (data.ssl === "false" || data.tls === "false") {
          if (connector !== "mongodb") config.ssl = undefined;
        }
      }

      const connectionData: CreateConnectionDto = {
        name: data.name || `${connector} Connection`,
        connection_type: connector as CreateConnectionDto["connection_type"],
        config: config as unknown as CreateConnectionDto["config"],
      };

      const created = await createConnection.mutateAsync(connectionData);

      const dataSource: DataSource = {
        id: created.id,
        name: created.name ?? data.name ?? `${connector} Connection`,
        type: (created.type ?? connector) as DataSource["type"],
        status: "connected",
        organizationId: organizationId,
        connectedAt: new Date().toISOString(),
      };
      addDataSource(dataSource);
      updateOnboarding({ dataSourceId: dataSource.id });
      toast.success("Connection successful!");
      router.push(`/onboarding/connect/${connector}/select`);
    } catch (error) {
      toast.error(
        "Failed to connect",
        error instanceof Error ? error.message : "Please check your credentials.",
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = () => {
    toast.info("Redirecting to OAuth...");
    setTimeout(() => {
      const dataSource: DataSource = {
        id: `ds_${Date.now()}`,
        name: `${connector} Connection`,
        type: connector as DataSource["type"],
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
  const isDatabaseConnector = ["postgres", "mysql", "mongodb"].includes(
    connector,
  );

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
                  <CardTitle>
                    Connect{" "}
                    {connector === "google-sheets"
                      ? "Google Sheets"
                      : connector}
                  </CardTitle>
                  <CardDescription>
                    Step 2 of 3 - Authenticate with your account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  Click the button below to authenticate with your Google
                  account and grant access to your sheets.
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
                  <CardTitle>
                    Upload {connector === "excel" ? "Excel" : "CSV"} File
                  </CardTitle>
                  <CardDescription>
                    Step 2 of 3 - Upload your data file
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  Upload your {connector === "excel" ? "Excel" : "CSV"} file to
                  get started.
                </p>
                <Input
                  type="file"
                  accept={connector === "excel" ? ".xlsx,.xls" : ".csv"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const dataSource: DataSource = {
                        id: `ds_${Date.now()}`,
                        name: file.name,
                        type: connector as DataSource["type"],
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
                <Button variant="ghost" onClick={handleSkip}>
                  Skip for now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isDatabaseConnector && schema) {
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
                  <CardDescription>
                    Step 2 of 3 - Enter your connection details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Sync Mode toggle for database connectors (Phase 5) */}
                  {isDatabaseConnector && (
                    <FormField
                      control={form.control}
                      name="sync_mode"
                      render={({ field: formField }) => (
                        <FormItem className="rounded-lg border p-4">
                          <FormLabel>Sync Mode</FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={formField.value || "full"}
                              onValueChange={formField.onChange}
                              className="flex flex-col gap-2 pt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="full" id="sync-full" />
                                <FormLabel
                                  htmlFor="sync-full"
                                  className="cursor-pointer font-normal"
                                >
                                  Full Sync
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="incremental"
                                  id="sync-cdc"
                                />
                                <FormLabel
                                  htmlFor="sync-cdc"
                                  className="cursor-pointer font-normal"
                                >
                                  Log-Based CDC
                                </FormLabel>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-2">
                            {connector === "postgres"
                              ? "CDC requires wal_level=logical and a replication slot."
                              : connector === "mysql"
                                ? "CDC requires binlog to be enabled."
                                : "CDC uses MongoDB oplog for change capture."}
                          </p>
                        </FormItem>
                      )}
                    />
                  )}
                  {schema.fields.map((field) => {
                    if (field.dependsOn) {
                      const dependencyValue = allValues[field.dependsOn.field];
                      if (
                        String(dependencyValue) !==
                        String(field.dependsOn.value)
                      ) {
                        return null;
                      }
                    }

                    return (
                      <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel>
                              {field.label}
                              {field.required && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </FormLabel>
                            <FormControl>
                              {field.type === "select" ? (
                                <Select
                                  value={formField.value || ""}
                                  onValueChange={formField.onChange}
                                >
                                  <SelectTrigger className="h-10">
                                    <SelectValue
                                      placeholder={field.placeholder}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options?.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : field.type === "password" ? (
                                <div className="relative">
                                  <Input
                                    type={
                                      visiblePasswordFields[field.name]
                                        ? "text"
                                        : "password"
                                    }
                                    placeholder={field.placeholder}
                                    {...formField}
                                    className="h-10 pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setVisiblePasswordFields((prev) => ({
                                        ...prev,
                                        [field.name]: !prev[field.name],
                                      }))
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    tabIndex={-1}
                                  >
                                    {visiblePasswordFields[field.name] ? (
                                      <Eye className="h-4 w-4" />
                                    ) : (
                                      <EyeOff className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <Input
                                  type={field.type === "number" ? "number" : "text"}
                                  placeholder={field.placeholder}
                                  {...formField}
                                  className="h-10"
                                />
                              )}
                            </FormControl>
                            {field.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {field.description}
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    );
                  })}
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
                <CardDescription>
                  Step 2 of 3 - Enter your connection details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-4">
              Loading connection form...
            </p>
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/onboarding/data-source")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button variant="ghost" onClick={handleSkip}>
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
