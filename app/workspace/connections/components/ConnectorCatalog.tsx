"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Connector } from "../data/connectors";
import { CONNECTORS } from "../data/connectors";
import { ConnectorCard } from "./ConnectorCard";
import { CategoryTabs, type CategoryFilter } from "./CategoryTabs";
import { RoleToggle } from "./RoleToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectorCatalogProps {
  role: "source" | "destination";
  showRoleToggle?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  title?: string;
  description?: string;
  className?: string;
}

function filterByCategory(
  connectors: Connector[],
  category: CategoryFilter,
): Connector[] {
  if (category === "all") return connectors;
  return connectors.filter((c) => c.category === category);
}

function filterBySearch(connectors: Connector[], query: string): Connector[] {
  if (!query.trim()) return connectors;
  const q = query.toLowerCase().trim();
  return connectors.filter((c) =>
    c.displayName.toLowerCase().includes(q),
  );
}

export function ConnectorCatalog({
  role,
  showRoleToggle = true,
  showBackButton = false,
  onBack,
  title = "Connections",
  description = "Connect your first database to start building pipelines.",
  className,
}: ConnectorCatalogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const filtered = useMemo(() => {
    let list = CONNECTORS;
    list = filterByCategory(list, category);
    list = filterBySearch(list, search);
    return list;
  }, [category, search]);

  const available = useMemo(
    () => filtered.filter((c) => c.wave === 1),
    [filtered],
  );
  const comingSoon = useMemo(
    () => filtered.filter((c) => c.wave > 1),
    [filtered],
  );

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {showBackButton && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1 text-sm"
            >
              ← Back to Connections
            </button>
          )}
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        {showRoleToggle && (
          <div className="shrink-0">
            <RoleToggle value={role} />
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search connectors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
            onClick={() => setSearch("")}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      <CategoryTabs value={category} onChange={setCategory} />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No connectors match &quot;{search}&quot;
        </p>
      ) : (
        <div className="space-y-8">
          {available.length > 0 && (
            <section>
              <h2 className="text-muted-foreground mb-4 text-sm font-medium uppercase tracking-wide">
                Available Now
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((connector) => (
                  <ConnectorCard
                    key={connector.id}
                    connector={connector}
                    role={role}
                  />
                ))}
              </div>
            </section>
          )}
          {comingSoon.length > 0 && (
            <section>
              <h2 className="text-muted-foreground mb-4 text-sm font-medium uppercase tracking-wide">
                Coming Soon
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {comingSoon.map((connector) => (
                  <ConnectorCard
                    key={connector.id}
                    connector={connector}
                    role={role}
                    isComingSoon
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
