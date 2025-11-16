"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * PageHeader
 * @description Standardized page header component with title, description, and optional action button.
 * Used across workspace pages, onboarding pages, and other page-level components.
 * @param {PageHeaderProps} props - Component properties
 * @param {string} props.title - Page title
 * @param {string} [props.description] - Page description/subtitle
 * @param {React.ReactNode} [props.action] - Action element (e.g., button) displayed on the right
 * @param {React.ReactNode} [props.breadcrumbs] - Breadcrumb navigation component
 * @param {React.ReactNode} [props.backButton] - Back navigation button
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} PageHeader component
 * @example
 * <PageHeader
 *   title="Dashboard"
 *   description="Manage your dashboards"
 *   action={<Button>New Dashboard</Button>}
 * />
 */
export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  backButton?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumbs,
  backButton,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4 pb-6", className)}>
      {breadcrumbs && <div className="flex items-center">{breadcrumbs}</div>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {backButton && <div className="shrink-0 mt-1">{backButton}</div>}
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0 flex items-center">{action}</div>}
      </div>
    </div>
  );
}
