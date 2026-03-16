"use client";

import { cn } from "@/lib/utils";

export type ConnectionRole = "source" | "destination";

interface RoleToggleProps {
  value: ConnectionRole;
  onChange: (role: ConnectionRole) => void;
  className?: string;
}

export function RoleToggle({ value, onChange, className }: RoleToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-input bg-muted p-0.5",
        className,
      )}
      role="tablist"
      aria-label="Connection role"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "source"}
        onClick={() => onChange("source")}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          value === "source"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Source
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "destination"}
        onClick={() => onChange("destination")}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          value === "destination"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Destination
      </button>
    </div>
  );
}
