"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePipelineBuilderStore } from "../store/pipelineStore";
import { DestinationPanel } from "../panels/DestinationPanel";
import { FilterPanel } from "../panels/FilterPanel";
import { JoinPanel } from "../panels/JoinPanel";
import { PipelineSettingsDrawer } from "../panels/PipelineSettingsDrawer";
import { RunDetailsDrawer } from "../panels/RunDetailsDrawer";
import { RunHistoryDrawer } from "../panels/RunHistoryDrawer";
import { RunStatusDrawer } from "../panels/RunStatusDrawer";
import { ScheduleDrawer } from "../panels/ScheduleDrawer";
import { SourcePanel } from "../panels/SourcePanel";
import { TransformPanel } from "../panels/TransformPanel";

export function DrawerContainer() {
  const drawerState = usePipelineBuilderStore((s) => s.drawerState);
  const closeDrawer = usePipelineBuilderStore((s) => s.closeDrawer);

  const isOpen = drawerState.isOpen;
  const type = drawerState.type;

  const handleOpenChange = (open: boolean) => {
    if (!open) closeDrawer();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] overflow-y-auto"
      >
        {type === "source" && <SourcePanel />}
        {type === "transform" && (
          <TransformPanel
            branchId={drawerState.branchId}
            nodeId={drawerState.nodeId}
          />
        )}
        {type === "filter" && (
          <FilterPanel
            branchId={drawerState.branchId}
            nodeId={drawerState.nodeId}
          />
        )}
        {type === "join" && <JoinPanel nodeId={drawerState.nodeId} />}
        {type === "destination" && (
          <DestinationPanel
            branchId={drawerState.branchId}
            nodeId={drawerState.nodeId}
          />
        )}
        {type === "run_status" && <RunStatusDrawer />}
        {type === "run_history" && <RunHistoryDrawer />}
        {type === "run_details" && (
          <RunDetailsDrawer runId={drawerState.runId} />
        )}
        {type === "schedule" && <ScheduleDrawer />}
        {type === "settings" && <PipelineSettingsDrawer />}
      </SheetContent>
    </Sheet>
  );
}
