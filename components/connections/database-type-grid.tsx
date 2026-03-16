"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  getAvailabilityBadge,
  getAvailableDatabases,
  type DatabaseRegistryEntry,
} from "@/config/database-registry";
import { getIconComponent } from "@/components/data-sources";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import type { ConnectionRole } from "./role-toggle";

interface DatabaseTypeGridProps {
  role: ConnectionRole;
  onSelect: (entry: DatabaseRegistryEntry) => void;
}

export function DatabaseTypeGrid({ role, onSelect }: DatabaseTypeGridProps) {
  const databases = getAvailableDatabases(1);

  const isDisabled = (entry: DatabaseRegistryEntry) => {
    if (role === "source" && !entry.source) return true;
    if (role === "destination" && !entry.dest) return true;
    return false;
  };

  const getDisabledTooltip = (entry: DatabaseRegistryEntry) => {
    if (role === "source" && !entry.source) return "Only available as a destination.";
    if (role === "destination" && !entry.dest) return "Only available as a source.";
    return null;
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {databases.map((entry) => {
          const disabled = isDisabled(entry);
          const tooltip = getDisabledTooltip(entry);
          const badge = getAvailabilityBadge(entry);

          const card = (
            <button
              type="button"
              onClick={() => !disabled && onSelect(entry)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-all",
                disabled
                  ? "cursor-not-allowed opacity-60 bg-muted/30"
                  : "cursor-pointer hover:shadow-md hover:border-primary/50",
              )}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                  {getIconComponent(entry.icon, 24)}
                </div>
                {disabled && (
                  <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{entry.displayName}</p>
                <Badge variant={badge.variant} className="mt-1 text-xs">
                  {badge.label}
                </Badge>
              </div>
            </button>
          );

          if (tooltip) {
            return (
              <Tooltip key={entry.id}>
                <TooltipTrigger asChild>{card}</TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
              </Tooltip>
            );
          }

          return <div key={entry.id}>{card}</div>;
        })}
      </div>
    </TooltipProvider>
  );
}
