"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Role = "source" | "destination";

interface RoleToggleProps {
  value: Role;
  className?: string;
}

export function RoleToggle({ value, className }: RoleToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setRole = (role: Role) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("role", role);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-input bg-muted p-0.5",
        className,
      )}
      role="group"
    >
      <button
        type="button"
        onClick={() => setRole("source")}
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
        onClick={() => setRole("destination")}
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
