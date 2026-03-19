"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { usePipelineBuilderStore } from "../store/pipelineStore";

export function RunStatusDrawer() {
  const activeRun = usePipelineBuilderStore((s) => s.activeRun);

  const isComplete =
    activeRun.status === "success" || activeRun.status === "failed";

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          {activeRun.status === "running" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : activeRun.status === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : null}
          {isComplete ? "Run Complete" : "Run in Progress"}
        </SheetTitle>
        <SheetDescription>
          {activeRun.status === "running"
            ? `${Math.floor(activeRun.elapsedSeconds)}s elapsed`
            : "Per-branch progress"}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-5">
        {activeRun.branchProgress.map((branch) => (
          <div key={branch.branch_id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{branch.label}</span>
              <span>
                {branch.rows_synced.toLocaleString()} /{" "}
                {branch.total_estimated.toLocaleString()} rows
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${
                    branch.total_estimated > 0
                      ? (branch.rows_synced / branch.total_estimated) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        ))}
        {isComplete && (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            {activeRun.branchProgress.map((b) => (
              <div key={b.branch_id} className="flex justify-between py-1">
                <span>{b.label}</span>
                <span>
                  ✓ {b.rows_synced.toLocaleString()} rows
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
