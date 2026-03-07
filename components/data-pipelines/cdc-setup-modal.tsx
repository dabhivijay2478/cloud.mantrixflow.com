"use client";

import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Loader2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCdcStatus,
  useVerifyCdcAll,
  useVerifyCdcStep,
} from "@/lib/api/hooks/use-data-source";
import { toast } from "@/lib/utils/toast";

const STEP_LABELS: Record<string, string> = {
  wal_level: "Enable Logical Replication",
  wal2json: "Verify wal2json",
  replication_role: "Grant Replication Permission",
  replication_test: "Test Replication Connection",
};

export interface CdcSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string | undefined;
  dataSourceId: string | undefined;
  dataSourceName?: string;
  onVerified?: () => void;
}

export function CdcSetupModal({
  open,
  onOpenChange,
  organizationId,
  dataSourceId,
  dataSourceName,
  onVerified,
}: CdcSetupModalProps) {
  const [providerId, setProviderId] = useState<string>("");

  const { data: cdcStatus, isLoading: statusLoading } = useCdcStatus(
    organizationId,
    dataSourceId,
    open && !!organizationId && !!dataSourceId,
  );

  const verifyStep = useVerifyCdcStep(organizationId, dataSourceId);
  const verifyAll = useVerifyCdcAll(organizationId, dataSourceId);

  const status = cdcStatus?.cdc_prerequisites_status;
  const providers = cdcStatus?.cdc_providers ?? [];
  const steps = cdcStatus?.cdc_verify_steps ?? [
    "wal_level",
    "wal2json",
    "replication_role",
    "replication_test",
  ];

  const selectedProvider = providers.find((p) => p.id === providerId);
  const overallVerified = status?.overall === "verified";

  const getStepStatus = (step: string): "not_started" | "verified" | "failed" => {
    const key = `${step}_ok` as keyof typeof status;
    const ok = status?.[key];
    if (ok === true) return "verified";
    if (ok === false) return "failed";
    return "not_started";
  };

  const handleVerifyStep = async (step: string) => {
    try {
      const result = await verifyStep.mutateAsync({
        step,
        providerSelected: providerId || undefined,
      });
      if (result.ok) {
        toast.success("Step verified", `${STEP_LABELS[step] ?? step} is configured correctly.`);
      } else {
        toast.error(
          "Verification failed",
          result.error ?? "Could not verify this step.",
        );
      }
    } catch (error) {
      toast.error(
        "Verification failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handleVerifyAll = async () => {
    try {
      const result = await verifyAll.mutateAsync(providerId || undefined);
      if (result.ok) {
        toast.success(
          "CDC setup complete",
          "All prerequisites are verified. You can now run log-based sync.",
        );
        onVerified?.();
        onOpenChange(false);
      } else {
        toast.error(
          "Verification failed",
          "One or more steps did not pass. Check the errors above.",
        );
      }
    } catch (error) {
      toast.error(
        "Verification failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[560px]"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle>Set Up Log-Based Sync</DialogTitle>
          <DialogDescription>
            {dataSourceName
              ? `Configure CDC prerequisites for ${dataSourceName}`
              : "Complete these steps to enable log-based incremental sync for your PostgreSQL source."}
          </DialogDescription>
        </DialogHeader>

        {statusLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Provider selector */}
            {providers.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Your PostgreSQL provider</label>
                <Select
                  value={providerId || (providers[0]?.id ?? "")}
                  onValueChange={setProviderId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Stepper */}
            <div className="space-y-4">
              {steps.map((step, idx) => {
                const stepStatus = getStepStatus(step);
                const instruction = selectedProvider?.instructions?.[step] as
                  | {
                      title?: string;
                      content?: string;
                      link?: string;
                      sql_template?: string;
                      verified_by_default?: boolean;
                    }
                  | undefined;
                const title =
                  instruction?.title ?? STEP_LABELS[step] ?? step;
                const content = instruction?.content ?? "";
                const sqlTemplate = instruction?.sql_template;
                const link = instruction?.link;
                const verifiedByDefault = instruction?.verified_by_default;

                return (
                  <div
                    key={step}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {stepStatus === "verified" || verifiedByDefault ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : stepStatus === "failed" ? (
                          <XCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{title}</div>
                        {content && (
                          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                            {content}
                          </p>
                        )}
                        {sqlTemplate && (
                          <pre className="mt-2 p-3 rounded bg-muted text-xs font-mono overflow-x-auto">
                            {sqlTemplate.replace("{username}", "your_username")}
                          </pre>
                        )}
                        {link && (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                          >
                            View documentation
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {!verifiedByDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => handleVerifyStep(step)}
                            disabled={verifyStep.isPending}
                          >
                            {verifyStep.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : stepStatus === "verified" ? (
                              "Verified"
                            ) : (
                              "Verify"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleVerifyAll}
            disabled={
              verifyAll.isPending ||
              statusLoading ||
              !organizationId ||
              !dataSourceId
            }
          >
            {verifyAll.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            I&apos;ve Completed These Steps
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
