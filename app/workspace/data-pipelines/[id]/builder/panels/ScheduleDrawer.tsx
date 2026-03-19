"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScheduleEditor } from "@/components/data-pipelines";
import type { ScheduleType } from "@/lib/api/types/data-pipelines";
import { usePipelineBuilderStore } from "../store/pipelineStore";

export function ScheduleDrawer() {
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const updatePipelineMetadata = usePipelineBuilderStore(
    (s) => s.updatePipelineMetadata,
  );

  const [scheduleConfig, setScheduleConfig] = useState({
    scheduleType: (pipeline?.pipeline.scheduleType ?? "none") as ScheduleType,
    scheduleValue: pipeline?.pipeline.scheduleValue ?? "",
    scheduleTimezone: pipeline?.pipeline.scheduleTimezone ?? "UTC",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pipeline?.pipeline) {
      setScheduleConfig({
        scheduleType: (pipeline.pipeline.scheduleType ?? "none") as ScheduleType,
        scheduleValue: pipeline.pipeline.scheduleValue ?? "",
        scheduleTimezone: pipeline.pipeline.scheduleTimezone ?? "UTC",
      });
    }
  }, [pipeline?.pipeline?.scheduleType, pipeline?.pipeline?.scheduleValue, pipeline?.pipeline?.scheduleTimezone]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePipelineMetadata(scheduleConfig);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>Pipeline Schedule</SheetTitle>
        <SheetDescription>
          Configure automatic pipeline runs
        </SheetDescription>
      </SheetHeader>
      <div className="flex-1 space-y-4 py-4">
        <ScheduleEditor
          scheduleType={scheduleConfig.scheduleType}
          scheduleValue={scheduleConfig.scheduleValue}
          scheduleTimezone={scheduleConfig.scheduleTimezone}
          onChange={(c) =>
            setScheduleConfig({
              scheduleType: c.scheduleType,
              scheduleValue: c.scheduleValue,
              scheduleTimezone: c.scheduleTimezone,
            })
          }
        />
      </div>
      <SheetFooter>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Schedule
        </Button>
      </SheetFooter>
    </>
  );
}
