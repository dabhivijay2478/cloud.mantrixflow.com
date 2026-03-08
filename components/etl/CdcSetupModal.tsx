"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { EtlService, type EtlCdcSetupResponse } from "@/lib/api/services/etl.service";

interface CdcSetupModalProps {
  sourceType: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CdcSetupModal({
  sourceType,
  isOpen,
  onClose,
}: CdcSetupModalProps) {
  const [setup, setSetup] = useState<EtlCdcSetupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && sourceType) {
      setLoading(true);
      setError(null);
      EtlService.getCdcSetup(sourceType)
        .then(setSetup)
        .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
        .finally(() => setLoading(false));
    } else {
      setSetup(null);
      setError(null);
    }
  }, [isOpen, sourceType]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {setup?.setup?.title ?? `Enable CDC on ${sourceType}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!setup?.cdc_supported && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                CDC is not supported for this source type. Choose Incremental
                sync instead.
              </AlertDescription>
            </Alert>
          )}
          {loading && (
            <div className="text-muted-foreground text-sm">Loading...</div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {setup?.setup?.steps && setup.setup.steps.length > 0 && (
            <ol className="list-decimal list-inside space-y-3 text-sm">
              {setup.setup.steps.map((step, i) => (
                <li key={i} className="leading-relaxed">
                  {step.includes("SELECT") || step.includes("CREATE") ? (
                    <code className="block mt-2 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                      {step}
                    </code>
                  ) : (
                    step
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
