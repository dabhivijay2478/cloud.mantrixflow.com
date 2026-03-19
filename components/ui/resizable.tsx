"use client";

import { Group, Panel, Separator } from "react-resizable-panels";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof Group>) => (
  <Group
    className={cn("flex h-full w-full data-[orientation=vertical]:flex-col", className)}
    {...props}
  />
);

const ResizablePanel = Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & { withHandle?: boolean }) => (
  <Separator
    className={cn(
      "group relative flex items-center justify-center bg-transparent hover:bg-zinc-700/30 data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full data-[orientation=horizontal]:w-2 data-[orientation=horizontal]:cursor-col-resize transition-colors",
      className,
    )}
    {...props}
  >
    <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-zinc-800 group-hover:bg-zinc-600 transition-colors" />
    {withHandle && (
      <div className="relative z-10 flex h-8 w-3 items-center justify-center rounded-sm bg-zinc-700 group-hover:bg-zinc-600 transition-colors shadow-sm">
        <GripVertical className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
      </div>
    )}
  </Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
