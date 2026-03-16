"use client";

import { useCallback, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { RoleToggle, type ConnectionRole } from "./role-toggle";
import { DatabaseTypeGrid } from "./database-type-grid";
import {
  getAvailableDatabases,
  getDatabaseById,
  type DatabaseRegistryEntry,
} from "@/config/database-registry";
import { getIconComponent } from "@/components/data-sources";
import { cn } from "@/lib/utils";
import type { CreateConnectionDto } from "@/lib/api/types/data-sources";

type FormValues = Record<string, string>;

interface ConnectionWizardProps {
  organizationId: string;
  initialRole?: ConnectionRole;
  onCreate: (data: CreateConnectionDto) => Promise<void>;
  onTestConnection: (data: { type: string; config: Record<string, unknown> }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onSuccess: () => void;
}

export function ConnectionWizard({
  organizationId,
  initialRole = "source",
  onCreate,
  onTestConnection,
  onSuccess,
}: ConnectionWizardProps) {
  const [role, setRole] = useState<ConnectionRole>(initialRole);
  const [step, setStep] = useState(1);
  const [selectedDb, setSelectedDb] = useState<DatabaseRegistryEntry | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    version?: string;
    database?: string;
    tables?: number;
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const databases = getAvailableDatabases(1);
  const registry = selectedDb ? getDatabaseById(selectedDb.id) : null;

  const form = useForm<FormValues>({
    defaultValues: {},
  });

  const buildConfigFromValues = useCallback(
    (values: FormValues): Record<string, unknown> => {
      if (!selectedDb) return {};
      const config: Record<string, unknown> = {};
      const skipKeys = ["name", "description"];
      for (const [key, value] of Object.entries(values)) {
        if (skipKeys.includes(key) || value === undefined || value === "") continue;
        if (key === "port") {
          config[key] = parseInt(String(value), 10) || selectedDb.defaultPort;
        } else {
          config[key] = value;
        }
      }
      if (selectedDb.id === "sqlite" && values.path) {
        config.path = values.path;
      }
      if (
        ["postgres", "mysql", "mariadb", "mssql"].includes(selectedDb.id) &&
        (values.ssl === "true" || values.ssl_mode === "require" || values.ssl_mode === "verify-ca" || values.ssl_mode === "verify-full")
      ) {
        config.ssl = { enabled: true };
        if (selectedDb.id === "postgres" && values.ssl_mode) {
          config.ssl_mode = values.ssl_mode;
        }
      }
      return config;
    },
    [selectedDb],
  );

  const handleSelectDb = useCallback((entry: DatabaseRegistryEntry) => {
    setSelectedDb(entry);
    setTestResult(null);
    const defaults: FormValues = {};
    for (const f of entry.credentialFields) {
      defaults[f.name] = "";
      if (f.default !== undefined) defaults[f.name] = String(f.default);
      if (f.name === "schema" && entry.showSchema) defaults[f.name] = "public";
      if (f.name === "schema" && entry.id === "mssql") defaults[f.name] = "dbo";
    }
    form.reset(defaults);
    setStep(2);
  }, [form]);

  const handleTest = useCallback(async () => {
    if (!selectedDb) return;
    const values = form.getValues();
    setTesting(true);
    setTestResult(null);
    try {
      const config = buildConfigFromValues(values);
      if (selectedDb.id === "sqlite") {
        config.path = values.path;
      } else {
        config.host = values.host;
        config.port = parseInt(values.port, 10) || selectedDb.defaultPort;
        config.database = values.database;
        config.username = values.username;
        config.password = values.password;
        if (values.schema) config.schema = values.schema;
        if (values.ssl_mode) config.ssl_mode = values.ssl_mode;
        if (values.ssl === "true") config.ssl = { enabled: true };
      }
      const result = await onTestConnection({
        type: selectedDb.id,
        config,
      });
      setTestResult({
        success: result.success,
        message: result.success ? "Connected" : result.error,
      });
    } catch (e) {
      setTestResult({
        success: false,
        message: e instanceof Error ? e.message : "Connection failed",
      });
    } finally {
      setTesting(false);
    }
  }, [selectedDb, form, buildConfigFromValues, onTestConnection]);

  const handleSave = useCallback(async () => {
    if (!selectedDb) return;
    const values = form.getValues();
    const name = (values.name || "").trim();
    if (!name) {
      form.setError("name", { message: "Connection name is required" });
      return;
    }
    setSaving(true);
    try {
      const config = buildConfigFromValues(values);
      if (selectedDb.id !== "sqlite") {
        config.host = values.host;
        config.port = parseInt(values.port, 10) || selectedDb.defaultPort;
        config.database = values.database;
        config.username = values.username;
        config.password = values.password;
        if (values.schema) config.schema = values.schema;
        if (values.ssl_mode) config.ssl_mode = values.ssl_mode;
        if (values.ssl === "true") config.ssl = { enabled: true };
      }
      await onCreate({
        name,
        connection_type: selectedDb.id,
        connector_role: role,
        config: config as unknown as CreateConnectionDto["config"],
      });
      onSuccess();
    } catch (e) {
      form.setError("root", {
        message: e instanceof Error ? e.message : "Failed to create connection",
      });
    } finally {
      setSaving(false);
    }
  }, [selectedDb, role, form, buildConfigFromValues, onCreate, onSuccess]);

  const renderField = (field: DatabaseRegistryEntry["credentialFields"][0]) => {
    if (field.type === "select") {
      return (
        <Select
          onValueChange={(v) => form.setValue(field.name, v)}
          defaultValue={form.watch(field.name) ?? field.default}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (field.type === "password") {
      return (
        <Input
          type="password"
          placeholder={field.placeholder}
          {...form.register(field.name)}
        />
      );
    }
    if (field.type === "number") {
      return (
        <Input
          type="number"
          placeholder={field.placeholder}
          {...form.register(field.name)}
        />
      );
    }
    return (
      <Input
        placeholder={field.placeholder}
        {...form.register(field.name)}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {step === 1 && (role === "source" ? "New Source Connection" : "New Destination Connection")}
          {step === 2 && selectedDb && (
            <>New {role === "source" ? "Source" : "Destination"} Connection — {selectedDb.displayName}</>
          )}
          {step === 3 && "Save and Name"}
        </h1>
        <RoleToggle value={role} onChange={setRole} />
      </div>

      {step === 1 && (
        <>
          <p className="text-muted-foreground">Choose the database type you want to connect to.</p>
          <DatabaseTypeGrid role={role} onSelect={handleSelectDb} />
        </>
      )}

      {step === 2 && selectedDb && registry && (
        <>
          <div className="grid gap-4">
            {registry.credentialFields
              .filter((f) => !["name"].includes(f.name))
              .map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && " *"}
                  </Label>
                  {renderField(field)}
                  {field.description && (
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  )}
                </div>
              ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleTest} disabled={testing}>
              {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Connection
            </Button>
            {testResult && (
              <div className="space-y-3">
                <div
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm",
                    testResult.success ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive",
                  )}
                >
                  {testResult.success ? "✓" : "✗"} {testResult.message}
                </div>
                {testResult.success && selectedDb?.id === "postgres" && role === "source" && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    <p className="font-medium">CDC prerequisites (optional)</p>
                    <p className="mt-1 text-muted-foreground">
                      For log-based replication (CDC), ensure PostgreSQL has <code className="rounded bg-muted px-1">wal_level=logical</code>, replication role, and a logical decoding plugin (pgoutput or wal2json).
                    </p>
                  </div>
                )}
              </div>
            )}
            <Button
              onClick={() => {
                if (testResult?.success) {
                  const values = form.getValues();
                  const name = (values.name || "").trim();
                  if (!name && selectedDb) {
                    const host = values.host || "";
                    const env = host.includes("prod") ? "Production" : host.includes("staging") ? "Staging" : host.includes("dev") ? "Dev" : "My";
                    form.setValue("name", `${env} ${selectedDb.displayName}`);
                  }
                  setStep(3);
                }
              }}
              disabled={!testResult?.success}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {step === 3 && selectedDb && registry && (
        <>
          <p className="text-sm text-muted-foreground">
            This connection will be saved as a {role === "source" ? "Source" : "Destination"}. It can
            be used in pipeline {role === "source" ? "source" : "destination"} selectors.
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Connection Name *</Label>
              <Input
                id="name"
                placeholder={`e.g. Production ${selectedDb?.displayName ?? ""}`}
                {...form.register("name", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Optional description"
                {...form.register("description")}
              />
            </div>
          </div>
          <div className="rounded-lg border p-4 text-sm">
            <p className="font-medium mb-2">Summary</p>
            <p>
              {registry.displayName}
              {selectedDb.id === "sqlite"
                ? ` · ${form.watch("path") || "—"}`
                : ` · ${form.watch("host") || "—"}:${form.watch("port") || selectedDb.defaultPort}/${form.watch("database") || "—"}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Connection
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
