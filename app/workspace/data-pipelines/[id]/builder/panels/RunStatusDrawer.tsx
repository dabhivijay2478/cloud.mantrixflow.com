"use client";

import { Loader2 } from "lucide-react";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function RunStatusDrawer() {
  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Run in Progress
        </SheetTitle>
        <SheetDescription>Live metrics and progress</SheetDescription>
      </SheetHeader>
      <div className="flex-1 py-4">
        <p className="text-sm text-muted-foreground">
          Per-branch progress. (To be implemented with realtime)
        </p>
      </div>
    </>
  );
}
