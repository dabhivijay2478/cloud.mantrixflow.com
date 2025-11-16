"use client";

import type { LucideIcon } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * EmptyState
 * @description Standardized empty state component with icon, title, description, and optional CTA.
 * Used when there's no data to display or when prompting user action.
 * @param {EmptyStateProps} props - Component properties
 * @param {LucideIcon} [props.icon] - Icon component from lucide-react
 * @param {string} props.title - Empty state title
 * @param {string} [props.description] - Empty state description
 * @param {string} [props.actionLabel] - CTA button label
 * @param {() => void} [props.onAction] - CTA button click handler
 * @param {React.ReactNode} [props.action] - Custom action element (overrides actionLabel/onAction)
 * @param {React.ReactNode} [props.children] - Additional content below description
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.centered] - Center the empty state (default: true)
 * @returns {JSX.Element} EmptyState component
 * @example
 * <EmptyState
 *   icon={FileText}
 *   title="No dashboards yet"
 *   description="Get started by creating your first dashboard"
 *   actionLabel="Create Dashboard"
 *   onAction={() => router.push("/dashboards/new")}
 * />
 */
export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  centered?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  children,
  className,
  centered = true,
}: EmptyStateProps) {
  const content = (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader className={cn(centered && "text-center")}>
        {Icon && (
          <div
            className={cn(
              "mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center",
              !centered && "mx-0",
            )}
          >
            <Icon className="h-8 w-8 text-primary" />
          </div>
        )}
        <CardTitle
          className={cn("text-2xl", !Icon && !centered && "text-left")}
        >
          {title}
        </CardTitle>
        {description && (
          <CardDescription
            className={cn("text-base mt-2", !centered && "text-left")}
          >
            {description}
          </CardDescription>
        )}
      </CardHeader>
      {(action || (actionLabel && onAction) || children) && (
        <CardContent className={cn("space-y-4", centered && "text-center")}>
          {action ||
            (actionLabel && onAction && (
              <Button
                onClick={onAction}
                size="lg"
                className={centered ? "w-full" : ""}
              >
                {actionLabel}
              </Button>
            ))}
          {children}
        </CardContent>
      )}
    </Card>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {content}
      </div>
    );
  }

  return content;
}
