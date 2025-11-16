"use client";

import type * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * ChartWrapper
 * @description Standardized wrapper for all chart components.
 * Provides consistent Card + Header + Content structure used across all BI charts.
 * @param {ChartWrapperProps} props - Component properties
 * @param {React.ReactNode} props.children - Chart content (typically ChartContainer)
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} ChartWrapper component
 * @example
 * <ChartWrapper title="Revenue Trends" description="Monthly revenue over time">
 *   <ChartContainer config={config}>
 *     <LineChart data={data} />
 *   </ChartContainer>
 * </ChartWrapper>
 */
export interface ChartWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function ChartWrapper({
  children,
  title,
  description,
  className,
}: ChartWrapperProps) {
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {(title || description) && (
        <CardHeader className="flex-shrink-0">
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent className="flex-1 min-h-0">{children}</CardContent>
    </Card>
  );
}
