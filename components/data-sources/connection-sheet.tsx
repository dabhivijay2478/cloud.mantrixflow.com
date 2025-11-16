"use client";

import { Check, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// Dynamic schema builder based on data source type
const buildConnectionSchema = (dataSourceType: string) => {
  const schema = connectionSchemas[dataSourceType];
  if (!schema) {
    return z.object({}).passthrough();
  }

  const schemaObject: Record<string, z.ZodTypeAny> = {};

  // Add connection string field if supported
  if (schema.connectionString) {
    schemaObject.connectionString = z.string().optional();
  }

  // Add all fields from schema
  schema.fields.forEach((field) => {
    if (field.required) {
      schemaObject[field.name] = z
        .string()
        .min(1, `${field.label} is required`);
    } else {
      schemaObject[field.name] = z.string().optional();
    }
  });

  return z.object(schemaObject).refine(
    (data) => {
      // If connection string is provided, it's valid
      if (schema.connectionString && data.connectionString) {
        return true;
      }
      // Otherwise, all required fields must be present
      return schema.fields.every((field) => {
        if (!field.required) return true;
        return (
          data[field.name as keyof typeof data] &&
          String(data[field.name as keyof typeof data]).trim().length > 0
        );
      });
    },
    {
      message: "Please provide all required connection details",
    },
  );
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

  const dataSource = dataSourceId
    ? allDataSources.find((ds) => ds.id === dataSourceId)
    : null;
  const schema = dataSource ? connectionSchemas[dataSource.type] : null;

  const getDefaultValues = useCallback(() => {
    if (!schema) return {};
    const defaults: Record<string, string> = {};
    if (schema.connectionString) {
      defaults.connectionString = "";
    }
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
      const schema = buildConnectionSchema(dataSource.type);
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

  // Reset form when data source changes
  useEffect(() => {
    if (dataSourceId && open) {
      form.reset(getDefaultValues());
      setConnectionTestResult(null);
    }
  }, [dataSourceId, open, form, getDefaultValues]);

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
        // Default test connection behavior
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const success = Math.random() > 0.1;
        const result = {
          success,
          message: success
            ? "Connection successful! You can now save this connection."
            : "Connection failed. Please check your credentials and try again.",
        };
        setConnectionTestResult(result);
        if (success) {
          toast.success(
            "Connection test successful!",
            "The connection to your data source was successful.",
          );
        } else {
          toast.error(
            "Connection test failed",
            "Unable to connect to the data source. Please check your credentials and try again.",
          );
        }
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
      handleClose();
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
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-background p-2 rounded-lg border flex items-center justify-center">
              {getIconComponent(dataSource.iconType, 32)}
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xl font-semibold">
                Connect {dataSource.name}
              </SheetTitle>
              <SheetDescription className="mt-1.5 text-sm">
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
              {schema.connectionString && (
                <div className="space-y-2">
                  <Label
                    htmlFor="connectionString"
                    className="text-sm font-medium"
                  >
                    Connection String{" "}
                    <span className="text-muted-foreground font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <Textarea
                    id="connectionString"
                    placeholder={
                      dataSource.type === "postgres"
                        ? "postgresql://user:password@host:port/database"
                        : dataSource.type === "mysql"
                          ? "mysql://user:password@host:port/database"
                          : "Enter connection string"
                    }
                    {...form.register("connectionString")}
                    rows={3}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Or fill in individual fields below
                  </p>
                </div>
              )}

              {schema.connectionString && (
                <div className="relative">
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

              <div className="grid gap-4">
                {schema.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="text-sm font-medium">
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
                        className={
                          field.name === "credentials" ||
                          field.name === "headers"
                            ? "font-mono text-sm"
                            : ""
                        }
                      />
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        {...form.register(field.name)}
                        className={field.type === "password" ? "font-mono" : ""}
                      />
                    )}
                    {field.description && (
                      <p className="text-xs text-muted-foreground">
                        {field.description}
                      </p>
                    )}
                    {form.formState.errors[field.name] && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors[field.name]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {connectionTestResult && (
                <div
                  className={cn(
                    "p-4 rounded-lg border",
                    connectionTestResult.success
                      ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
                  )}
                >
                  <div className="flex items-start gap-2">
                    {connectionTestResult.success ? (
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          connectionTestResult.success
                            ? "text-green-800 dark:text-green-200"
                            : "text-red-800 dark:text-red-200",
                        )}
                      >
                        {connectionTestResult.success
                          ? "Connection Successful"
                          : "Connection Failed"}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          connectionTestResult.success
                            ? "text-green-700 dark:text-green-300"
                            : "text-red-700 dark:text-red-300",
                        )}
                      >
                        {connectionTestResult.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        <SheetFooter className="border-t bg-muted/30 px-6 py-4 gap-2 flex-col sm:flex-row shrink-0">
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
