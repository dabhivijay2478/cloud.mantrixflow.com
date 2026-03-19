"use client";

import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface RunDetailsDrawerProps {
  runId: string | null;
}

export function RunDetailsDrawer({ runId }: RunDetailsDrawerProps) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>Run Details</SheetTitle>
        <SheetDescription>
          {runId ? `Run ID: ${runId.slice(0, 8)}` : "Run metrics and breakdown"}
        </SheetDescription>
      </SheetHeader>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          Per-branch breakdown, schema changes. (To be implemented)
        </p>
      </div>
    </>
  );
}
