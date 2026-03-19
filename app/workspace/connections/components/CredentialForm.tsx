"use client";

import { Database, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { cn } from "@/lib/utils";

const MANTRIXFLOW_IPS = ["54.123.45.67", "54.123.45.68"];

interface CredentialFormProps {
  connector: Connector;
  role: "source" | "destination";
  connectionId?: string;
  isEdit?: boolean;
}

export function CredentialForm({
  connector,
  role,
  connectionId,
  isEdit = false,
}: CredentialFormProps) {
  const router = useRouter();
  const fields = getFieldsForConnector(connector.id);
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [testLoading, setTestLoading] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const updateField = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTest = async () => {
    setTestLoading(true);
    setTestError(null);
    await new Promise((r) => setTimeout(r, 1500));
    setTestLoading(false);
    setTestPassed(true);
  };

  const handleSave = async () => {
    if (!testPassed) return;
    setSaveLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaveLoading(false);
    router.push("/workspace/connections");
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
              disabled={testLoading}
            >
              {testLoading ? (
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
              disabled={!testPassed || saveLoading}
            >
              {saveLoading ? (
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
      <div className={cn("space-y-2", gridClass)}>
        <Label htmlFor={field.name}>{field.label}</Label>
        <Input
          id={field.name}
          type="password"
          placeholder={field.placeholder}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
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
