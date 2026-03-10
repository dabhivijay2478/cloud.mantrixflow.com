"use client";

import { format } from "date-fns";
import { Calendar, FileJson, Hash, MessageSquare, Tag, User, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ActionStatusBadge } from "@/components/shared";
import type { ActivityLog } from "@/lib/api/types/activity-logs";

export interface ActivityLogDetailSheetProps {
  log: ActivityLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 py-3 border-b border-border/60 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="text-sm">{value}</div>
      </div>
    </div>
  );
}

export function ActivityLogDetailSheet({
  log,
  open,
  onOpenChange,
}: ActivityLogDetailSheetProps) {
  if (!log) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        className="h-full max-h-none w-full max-w-2xl sm:max-w-2xl border-l rounded-l-lg data-[vaul-drawer-direction=right]:rounded-l-lg data-[vaul-drawer-direction=right]:rounded-r-none"
        aria-describedby={undefined}
      >
        <DrawerHeader className="border-b border-border/60 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DrawerTitle className="text-xl font-semibold">
                Activity Log Details
              </DrawerTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {log.entityType} · {log.actionType}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ActionStatusBadge actionType={log.actionType} />
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 min-h-0 overflow-auto">
          <div className="px-6 py-4 space-y-0">
            <DetailRow
              icon={MessageSquare}
              label="Message"
              value={
                <p className="font-medium text-foreground">{log.message}</p>
              }
            />
            <DetailRow
              icon={Calendar}
              label="Timestamp"
              value={
                <span className="font-mono text-sm">
                  {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                </span>
              }
            />
            <DetailRow
              icon={Tag}
              label="Entity Type"
              value={
                <span className="capitalize font-medium">{log.entityType}</span>
              }
            />
            <DetailRow
              icon={Tag}
              label="Action Type"
              value={<span className="font-mono text-sm">{log.actionType}</span>}
            />
            {log.entityId && (
              <DetailRow
                icon={Hash}
                label="Entity ID"
                value={
                  <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                    {log.entityId}
                  </code>
                }
              />
            )}
            {log.userId && (
              <DetailRow
                icon={User}
                label="User ID"
                value={
                  <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                    {log.userId}
                  </code>
                }
              />
            )}
            <DetailRow
              icon={Hash}
              label="Log ID"
              value={
                <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                  {log.id}
                </code>
              }
            />
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <DetailRow
                icon={FileJson}
                label="Metadata"
                value={
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto max-h-48 overflow-y-auto font-mono whitespace-pre-wrap break-words">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                }
              />
            )}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
