"use client";

import { Database, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Connector } from "../data/connectors";
import { getFieldsForConnector } from "../data/connectionFields";
import type { ConnectionFieldConfig } from "../data/connectionFields";
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
import type { CreateConnectionDto } from "@/lib/api/types/data-sources";
import {
  DataSourcesService,
  useCreateConnection,
  useConnectionLegacy,
  useTestConnectionLegacy,
} from "@/lib/api";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";

const MANTRIXFLOW_IPS = ["54.123.45.67", "54.123.45.68"];

function buildTestDto(
  connectorId: string,
  formData: Record<string, string | number>,
): Record<string, unknown> {
  const port = formData.port
    ? Number(formData.port)
    : connectorId === "mysql" || connectorId === "mariadb"
      ? 3306
      : connectorId === "mssql"
        ? 1433
        : connectorId === "oracle"
          ? 1521
          : connectorId === "cockroachdb"
            ? 26257
            : 5432;
  const sslMode = String(formData.sslMode ?? "require");
  return {
    type: connectorId,
    host: formData.host ?? "",
    port,
    database: formData.database ?? "",
    username: formData.username ?? "",
    password: formData.password ?? "",
    ssl:
      sslMode === "disable"
        ? { enabled: false }
        : { enabled: true, rejectUnauthorized: sslMode === "verify-full" },
  };
}

function buildCreateDto(
  connectorId: string,
  role: "source" | "destination",
  formData: Record<string, string | number>,
) {
  const config = buildTestDto(connectorId, formData) as Record<string, unknown>;
  const schema = formData.schema;
  if (schema) config.schema = schema;
  return {
    name: String(formData.connectionName ?? formData.name ?? "Connection"),
    connection_type: connectorId,
    connector_role: role,
    config,
  };
}

interface CredentialFormProps {
  connector: Connector;
  role: "source" | "destination";
  connectionId?: string;
  isEdit?: boolean;
  organizationId?: string;
}

export function CredentialForm({
  connector,
  role,
  connectionId,
  isEdit = false,
  organizationId,
}: CredentialFormProps) {
  const router = useRouter();
  const orgId = organizationId ?? useWorkspaceStore((s) => s.currentOrganization?.id);
  const fields = getFieldsForConnector(connector.id);
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [testPassed, setTestPassed] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const { data: existingConnection } = useConnectionLegacy(orgId, connectionId);
  const testConnection = useTestConnectionLegacy(orgId);
  const createConnection = useCreateConnection(orgId);

  useEffect(() => {
    const conn = existingConnection as { config?: Record<string, unknown>; name?: string } | undefined;
    if (isEdit && connectionId && conn?.config) {
      const cfg = conn.config;
      const initial: Record<string, string | number> = {
        connectionName: conn.name ?? "",
        host: (cfg.host as string) ?? "",
        port: (cfg.port as number) ?? 5432,
        database: (cfg.database as string) ?? "",
        username: (cfg.username as string) ?? "",
        password: (cfg.password as string) ?? "",
        schema: (cfg.schema as string) ?? "public",
        sslMode: (cfg.ssl as { enabled?: boolean })?.enabled ? "require" : "disable",
      };
      setFormData(initial);
    }
  }, [isEdit, connectionId, existingConnection]);

  const updateField = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTest = async () => {
    setTestError(null);
    if (!orgId) return;
    try {
      const dto = buildTestDto(connector.id, formData);
      const result = await testConnection.mutateAsync({
        type: connector.id,
        host: dto.host as string,
        port: dto.port as number,
        database: dto.database as string,
        username: dto.username as string,
        password: dto.password as string,
        ssl: dto.ssl as { enabled: boolean },
      });
      setTestPassed(result.success);
      if (result.success) {
        showSuccessToast("connected", "Connection");
      } else {
        setTestError(result.error ?? "Test failed");
        showErrorToast("connectFailed", "Connection", result.error);
      }
    } catch (err) {
      setTestPassed(false);
      const msg = err instanceof Error ? err.message : "Test failed";
      setTestError(msg);
      showErrorToast("connectFailed", "Connection", msg);
    }
  };

  const handleSave = async () => {
    if (!testPassed || !orgId) return;
    setSaveLoading(true);
    try {
      if (isEdit && connectionId) {
        const dto = buildCreateDto(connector.id, role, formData);
        await DataSourcesService.createOrUpdateConnection(
          orgId,
          connectionId,
          dto as unknown as CreateConnectionDto,
        );
        showSuccessToast("updated", "Connection");
      } else {
        const dto = buildCreateDto(connector.id, role, formData);
        await createConnection.mutateAsync(dto as unknown as CreateConnectionDto);
        showSuccessToast("created", "Connection");
      }
      router.push("/workspace/connections");
    } catch (err) {
      showErrorToast(
        "saveFailed",
        "Data Source",
        err instanceof Error ? err.message : undefined,
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const copyIps = () => {
    navigator.clipboard.writeText(MANTRIXFLOW_IPS.join("\n"));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <form className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {fields.map((field) => (
            <FieldRenderer
              key={field.name}
              field={field}
              value={formData[field.name] ?? field.defaultValue ?? ""}
              onChange={(v) => updateField(field.name, v)}
            />
          ))}

          <div className="flex items-center gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={testConnection.isPending}
            >
              {testConnection.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Test Connection"
              )}
            </Button>
            {testPassed && (
              <span className="text-green-600 text-sm dark:text-green-400">
                ✓ Connected · {connector.displayName}
              </span>
            )}
            {testError && (
              <span className="text-destructive text-sm">{testError}</span>
            )}
          </div>

          <div className="border-t pt-6">
            <Button
              type="button"
              onClick={handleSave}
              disabled={
                !testPassed ||
                createConnection.isPending ||
                saveLoading
              }
            >
              {(createConnection.isPending || saveLoading) ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Save Connection"
              )}
            </Button>
            {connector.id === "postgres" && role === "source" && (
              <p className="text-muted-foreground mt-4 text-sm">
                Enable Change Data Capture for real-time sync
                {connectionId ? (
                  <>
                    {" → "}
                    <Link
                      href={`/workspace/connections/${connectionId}/cdc-setup`}
                      className="text-primary hover:underline"
                    >
                      Set up CDC
                    </Link>
                  </>
                ) : (
                  " (available after saving)"
                )}
              </p>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-lg border bg-muted/30 p-6">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <Database className="size-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">{connector.displayName}</h3>
            <p className="text-muted-foreground text-xs">
              {connector.sourceCapable && connector.destCapable
                ? "Source & Destination"
                : connector.sourceCapable
                  ? "Source only"
                  : "Destination only"}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium">Quick setup guide</h4>
            <ol className="text-muted-foreground mt-2 list-decimal space-y-1 pl-4 text-sm">
              <li>Create read-only database user</li>
              <li>Allow connection from MANTrixFlow IP addresses</li>
              <li>Enable SSL</li>
            </ol>
          </div>

          <div>
            <h4 className="text-sm font-medium">MANTrixFlow IPs</h4>
            <pre className="text-muted-foreground mt-1 rounded bg-muted p-2 text-xs">
              {MANTRIXFLOW_IPS.join("\n")}
            </pre>
            <Button variant="ghost" size="sm" className="mt-2" onClick={copyIps}>
              Copy all
            </Button>
          </div>

          <Link href="#" className="text-primary hover:underline text-sm">
            View docs →
          </Link>
        </div>
      </div>
    </div>
  );
}

function PasswordInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  gridClass,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  gridClass?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={cn("space-y-2", gridClass)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 transition-colors"
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: ConnectionFieldConfig;
  value: string | number;
  onChange: (v: string | number) => void;
}) {
  const gridClass =
    field.gridCol === "half"
      ? "lg:col-span-1"
      : field.gridCol === "third"
        ? "lg:col-span-1"
        : "lg:col-span-2";

  if (field.type === "password") {
    return (
      <PasswordInput
        id={field.name}
        label={field.label}
        placeholder={field.placeholder}
        value={String(value)}
        onChange={(v) => onChange(v)}
        gridClass={gridClass}
      />
    );
  }

  if (field.type === "number") {
    return (
      <div className={cn("space-y-2", gridClass)}>
        <Label htmlFor={field.name}>{field.label}</Label>
        <Input
          id={field.name}
          type="number"
          placeholder={field.placeholder}
          value={String(value)}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : "")
          }
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={cn("space-y-2", gridClass)}>
        <Label htmlFor={field.name}>{field.label}</Label>
        <Select
          value={String(value)}
          onValueChange={(v) => onChange(v)}
        >
          <SelectTrigger id={field.name}>
            <SelectValue placeholder={`Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", gridClass)}>
      <Label htmlFor={field.name}>{field.label}</Label>
      <Input
        id={field.name}
        type="text"
        placeholder={field.placeholder}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
