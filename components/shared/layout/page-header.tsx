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
    <div className={cn("space-y-2", className)}>
      {breadcrumbs && <div>{breadcrumbs}</div>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backButton && <div>{backButton}</div>}
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
