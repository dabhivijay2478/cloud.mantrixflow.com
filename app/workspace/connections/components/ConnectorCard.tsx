"use client";

import {
  Database,
  Cloud,
  Globe,
  FileText,
  Lock,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { Connector } from "../data/connectors";
import { CONNECTOR_CATEGORIES } from "../data/connectors";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  databases: Database,
  warehouses: Cloud,
  saas: Globe,
  files: FileText,
};

function ConnectorIcon({ connector }: { connector: Connector }) {
  const Icon = CATEGORY_ICONS[connector.category] ?? Database;
  const initial = connector.displayName.charAt(0);
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
      <Icon className="size-5 text-muted-foreground" />
      <span className="sr-only">{initial}</span>
    </div>
  );
}

interface ConnectorCardProps {
  connector: Connector;
  role: "source" | "destination";
  isComingSoon?: boolean;
}

function getRoleBadge(connector: Connector): {
  label: string;
  className: string;
} {
  if (connector.sourceCapable && connector.destCapable)
    return {
      label: "Source & Dest",
      className:
        "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
    };
  if (connector.sourceCapable)
    return {
      label: "Source only",
      className:
        "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    };
  return {
    label: "Dest only",
    className:
      "border-purple-500/50 bg-purple-500/10 text-purple-700 dark:text-purple-400",
  };
}

function supportsRole(connector: Connector, role: "source" | "destination"): boolean {
  if (role === "source") return connector.sourceCapable;
  return connector.destCapable;
}

export function ConnectorCard({
  connector,
  role,
  isComingSoon = false,
}: ConnectorCardProps) {
  const available = connector.wave === 1 && !isComingSoon;
  const supportsCurrentRole = supportsRole(connector, role);
  const isClickable = available && supportsCurrentRole;

  const categoryLabel =
    CONNECTOR_CATEGORIES[connector.category]?.label ?? connector.category;
  const roleBadge = getRoleBadge(connector);

  const cardContent = (
    <>
      <div className="relative">
        <ConnectorIcon connector={connector} />
        {connector.wave > 1 && (
          <div
            className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-muted"
            title="Available soon"
          >
            <Lock className="size-3 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium">{connector.displayName}</div>
        <div className="text-muted-foreground text-xs">{categoryLabel}</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {connector.wave === 1 ? (
            <>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  roleBadge.className,
                  !supportsCurrentRole && "opacity-60",
                )}
              >
                {roleBadge.label}
              </Badge>
              {connector.popular && (
                <Badge
                  variant="outline"
                  className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                >
                  Popular
                </Badge>
              )}
            </>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Coming Soon
            </Badge>
          )}
        </div>
      </div>
    </>
  );

  if (isClickable) {
    return (
      <Link
        href={`/workspace/connections/new/${connector.id}?role=${role}`}
        className={cn(
          "flex gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 hover:ring-2 hover:ring-primary/20",
          "cursor-pointer",
        )}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      title={connector.wave > 1 ? "Available soon" : undefined}
      className={cn(
        "flex gap-3 rounded-lg border bg-card p-4",
        connector.wave > 1 && "opacity-50 cursor-not-allowed",
        connector.wave === 1 && !supportsCurrentRole && "opacity-60",
      )}
    >
      {cardContent}
    </div>
  );
}
