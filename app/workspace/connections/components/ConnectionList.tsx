"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { MockConnection } from "../data/mockConnections";
import { MOCK_CONNECTIONS } from "../data/mockConnections";
import { ConnectionListRow } from "./ConnectionListRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ListRoleFilter = "all" | "source" | "destination";

interface ConnectionListProps {
  connections?: MockConnection[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  roleFilter: ListRoleFilter;
  onRoleFilterChange: (role: ListRoleFilter) => void;
  className?: string;
}

export function ConnectionList({
  connections = MOCK_CONNECTIONS,
  selectedId,
  onSelect,
  roleFilter,
  onRoleFilterChange,
  className,
}: ConnectionListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = connections;
    if (roleFilter === "source") {
      list = list.filter((c) => c.role === "source");
    } else if (roleFilter === "destination") {
      list = list.filter((c) => c.role === "destination");
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [connections, roleFilter, search]);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Connections</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your source and destination database connections.
          </p>
        </div>
        <Button asChild>
          <Link href="/workspace/connections/new">+ New Connection</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "source", "destination"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRoleFilterChange(r)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                roleFilter === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {r === "all" ? "All" : r === "source" ? "Sources" : "Destinations"}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search connections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            {search
              ? `No connections match "${search}"`
              : roleFilter === "all"
                ? "No connections yet."
                : `No ${roleFilter} connections.`}
          </p>
        ) : (
          filtered.map((conn) => (
            <ConnectionListRow
              key={conn.id}
              connection={conn}
              onClick={() => onSelect(conn.id)}
              isSelected={selectedId === conn.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
