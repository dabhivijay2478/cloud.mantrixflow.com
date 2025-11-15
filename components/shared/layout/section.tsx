"use client";

import type * as React from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Section
 * @description Grouped content container with title and optional separator.
 * Provides semantic sectioning for dashboard layouts and page content.
 * @param {SectionProps} props - Component properties
 * @param {React.ReactNode} props.children - Section content
 * @param {string} [props.title] - Section title
 * @param {string} [props.description] - Section description
 * @param {React.ReactNode} [props.action] - Action element (e.g., button) displayed in header
 * @param {boolean} [props.separator] - Show separator after header (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Section component
 * @example
 * <Section
 *   title="Revenue Overview"
 *   description="Monthly revenue and profit metrics"
 *   action={<Button>Export</Button>}
 * >
 *   <LineChart data={data} />
 * </Section>
 */
export interface SectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  separator?: boolean;
  className?: string;
}

export function Section({
  children,
  title,
  description,
  action,
  separator = true,
  className,
}: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description || action) && (
        <>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {title && (
                <h2 className="text-2xl font-semibold tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
          {separator && <Separator />}
        </>
      )}
      <div>{children}</div>
    </section>
  );
}
