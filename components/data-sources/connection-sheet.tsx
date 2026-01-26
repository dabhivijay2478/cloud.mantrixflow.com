"use client";

import { Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";
import { allDataSources, connectionSchemas } from "./constants";
import { getIconComponent } from "./utils";

type ConnectionFormValues = Record<string, string>;

// Dynamic schema builder based on data source type and current form values
const buildConnectionSchema = (
  dataSourceType: string,
  formValues: ConnectionFormValues,
) => {
  const schema = connectionSchemas[dataSourceType];
  if (!schema) {
    return z.object({}).passthrough();
  }

  const schemaObject: Record<string, z.ZodTypeAny> = {};

  // Add all fields from schema
  schema.fields.forEach((field) => {
    // Check if field is visible/active based on dependsOn
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
};

interface ConnectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataSourceId: string | null;
  onConnect: (data: ConnectionFormValues) => Promise<void>;
  onTestConnection?: (
    data: ConnectionFormValues,
  ) => Promise<{ success: boolean; message: string }>;
}

export function ConnectionSheet({
  open,
  onOpenChange,
  dataSourceId,
  onConnect,
  onTestConnection,
}: ConnectionSheetProps) {
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  // Track which password fields have visibility toggled
  const [visiblePasswordFields, setVisiblePasswordFields] = useState<
    Record<string, boolean>
  >({});

  // Toggle password field visibility
  const togglePasswordVisibility = (fieldName: string) => {
    setVisiblePasswordFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const dataSource = dataSourceId
    ? allDataSources.find((ds) => ds.id === dataSourceId)
    : null;
  const schema = dataSource ? connectionSchemas[dataSource.type] : null;

  const getDefaultValues = useCallback(() => {
    if (!schema) return {};
    const defaults: Record<string, string> = {};
    schema.fields.forEach((field) => {
      defaults[field.name] = "";
    });
    return defaults;
  }, [schema]);

  const form = useForm<ConnectionFormValues>({
    // @ts-expect-error - Custom resolver with dynamic schema
    resolver: (values, _context, _options) => {
      if (!dataSourceId || !dataSource) {
        return { values: values as ConnectionFormValues, errors: {} };
      }
      // Pass current values to schema builder for dynamic validation
      const schema = buildConnectionSchema(dataSource.type, values);
      const result = schema.safeParse(values);
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

  // Watch all values to trigger re-renders for dependency logic
  const allValues = form.watch();

  // Reset form when data source changes
  useEffect(() => {
    if (dataSourceId && open) {
      form.reset(getDefaultValues());
      setConnectionTestResult(null);
    }
  }, [dataSourceId, open, form, getDefaultValues]);

  // Handle default value setting for selects if needed immediately
  useEffect(() => {
    if (open && schema) {
      schema.fields.forEach((field) => {
        // Find fields that have a default valid option if not set
        // Specifically for useConnectionString select in MongoDB
        if (
          field.name === "useConnectionString" &&
          !form.getValues("useConnectionString")
        ) {
          form.setValue("useConnectionString", "false");
        }
      });
    }
  }, [open, schema, form]);

  const handleTestConnection = async () => {
    if (!dataSourceId || !dataSource) return;

    const formData = form.getValues();
    const isValid = await form.trigger();

    if (!isValid) {
      toast.error(
        "Please fill in all required fields",
        "All required connection fields must be filled before testing.",
      );
      return;
    }

    setTestingConnection(true);
    setConnectionTestResult(null);

    try {
      if (onTestConnection) {
        const result = await onTestConnection(formData);
        setConnectionTestResult(result);
        if (result.success) {
          toast.success(
            "Connection test successful!",
            "The connection to your data source was successful.",
          );
        } else {
          toast.error(
            "Connection test failed",
            result.message ||
              "Unable to connect to the data source. Please check your credentials and try again.",
          );
        }
      } else {
        // If no test connection handler provided, show error
        setConnectionTestResult({
          success: false,
          message:
            "Test connection handler not configured. Please configure the API integration.",
        });
        toast.error(
          "Test connection not available",
          "Test connection handler is not configured. Please contact support.",
        );
      }
    } catch {
      setConnectionTestResult({
        success: false,
        message: "An error occurred while testing the connection.",
      });
      toast.error(
        "Connection test failed",
        "An error occurred while testing the connection. Please try again.",
      );
    } finally {
      setTestingConnection(false);
    }
  };

  const handleConnect = async (data: ConnectionFormValues) => {
    if (!dataSourceId) return;

    setLoading(true);
    try {
      await onConnect(data);
      if (onOpenChange) {
        onOpenChange(false);
      }
      setConnectionTestResult(null);
      form.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setConnectionTestResult(null);
    form.reset();
  };

  if (!dataSource || !schema) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl flex flex-col p-0 h-full overflow-hidden"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 border">
              {getIconComponent(dataSource.iconType, 24)}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl font-semibold tracking-tight">
                Connect {dataSource.name}
              </SheetTitle>
              <SheetDescription className="mt-1.5 text-sm text-muted-foreground">
                Enter your connection details to connect this data source
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 py-6">
            <form
              onSubmit={form.handleSubmit(handleConnect)}
              className="space-y-6"
            >
              <div className="grid gap-4">
                {schema.fields.map((field, index) => {
                  // Check if field should be visible
                  if (field.dependsOn) {
                    const dependencyValue = allValues[field.dependsOn.field];
                    if (
                      String(dependencyValue) !== String(field.dependsOn.value)
                    ) {
                      return null;
                    }
                  }

                  // Add "Or" divider before individual fields if connection string is supported
                  const showOrDivider =
                    schema.connectionString &&
                    (field.name === "connectionString" ||
                      field.name === "connection_string") &&
                    index > 0;

                  const showOrAfterConnectionString =
                    schema.connectionString &&
                    (field.name === "connectionString" ||
                      field.name === "connection_string") &&
                    index < schema.fields.length - 1 &&
                    schema.fields[index + 1]?.name !== "connectionString" &&
                    schema.fields[index + 1]?.name !== "connection_string";

                  return (
                    <div key={field.name}>
                      {showOrDivider && (
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                              Or
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label
                          htmlFor={field.name}
                          className="text-sm font-medium text-foreground"
                        >
                          {field.label}
                          {field.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </Label>
                        {field.type === "textarea" ? (
                          <Textarea
                            id={field.name}
                            placeholder={field.placeholder}
                            {...form.register(field.name)}
                            rows={4}
                            className={cn(
                              field.name === "credentials" ||
                                field.name === "headers" ||
                                field.name === "connectionString" ||
                                field.name === "connection_string"
                                ? "font-mono text-sm"
                                : "",
                            )}
                          />
                        ) : field.type === "select" ? (
                          <Select
                            value={form.watch(field.name) || ""}
                            onValueChange={(value) => {
                              form.setValue(field.name, value);
                            }}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={field.placeholder} />
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
                              id={field.name}
                              type={
                                visiblePasswordFields[field.name]
                                  ? "text"
                                  : "password"
                              }
                              placeholder={field.placeholder}
                              {...form.register(field.name)}
                              className={cn("h-10 pr-10", "font-mono")}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                togglePasswordVisibility(field.name)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                            id={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            {...form.register(field.name)}
                            className="h-10"
                          />
                        )}
                        {field.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {field.description}
                          </p>
                        )}
                        {form.formState.errors[field.name] && (
                          <p className="text-xs text-destructive mt-1">
                            {form.formState.errors[field.name]?.message}
                          </p>
                        )}
                      </div>
                      {showOrAfterConnectionString && (
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                              Or
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {connectionTestResult && (
                <div
                  className={cn(
                    "p-4 rounded-lg border",
                    connectionTestResult.success
                      ? "bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/30"
                      : "bg-destructive/10 border-destructive/30",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        connectionTestResult.success
                          ? "bg-[hsl(var(--success))]/20"
                          : "bg-destructive/20",
                      )}
                    >
                      {connectionTestResult.success ? (
                        <Check className="h-4 w-4 text-[hsl(var(--success))]" />
                      ) : (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          connectionTestResult.success
                            ? "text-[hsl(var(--success))]"
                            : "text-destructive",
                        )}
                      >
                        {connectionTestResult.success
                          ? "Connection Successful"
                          : "Connection Failed"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {connectionTestResult.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        <SheetFooter className="border-t px-6 py-4 gap-3 flex-col sm:flex-row shrink-0">
          <div className="flex gap-2 w-full sm:w-auto order-2 sm:order-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            {schema.testConnection && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleTestConnection}
                disabled={testingConnection || loading}
                className="flex-1 sm:flex-initial"
              >
                {testingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Test Connection
                  </>
                )}
              </Button>
            )}
          </div>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleConnect)}
            disabled={loading || testingConnection}
            className="w-full sm:w-auto order-1 sm:order-2"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Connect
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
