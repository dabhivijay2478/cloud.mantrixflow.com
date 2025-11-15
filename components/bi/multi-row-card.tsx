"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * MultiRowCard
 * @description Multi-row card component for displaying multiple metrics or data points in a card layout.
 * @param {MultiRowCardProps} props - Component properties
 * @param {CardRow[]} props.rows - Array of card rows
 * @param {string} [props.title] - Card title
 * @param {string} [props.description] - Card description
 * @param {boolean} [props.showDividers] - Show dividers between rows (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} MultiRowCard component
 * @example
 * <MultiRowCard
 *   title="Sales Summary"
 *   rows={[
 *     { label: "Total Revenue", value: "$45,231", change: 12.5 },
 *     { label: "Orders", value: "1,234", change: -5.2 },
 *     { label: "Average Order", value: "$36.70", change: 8.1 }
 *   ]}
 * />
 */

export interface CardRow {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface MultiRowCardProps {
  rows: CardRow[];
  title?: string;
  description?: string;
  showDividers?: boolean;
  className?: string;
}

export function MultiRowCard({
  rows,
  title,
  description,
  showDividers = true,
  className,
}: MultiRowCardProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent className="p-0">
        {rows.map((row, index) => (
          <div
            key={index}
            className={cn(
              "p-4",
              showDividers &&
                index < rows.length - 1 &&
                "border-b border-border",
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {row.icon && (
                    <div className="text-muted-foreground">{row.icon}</div>
                  )}
                  <p className="text-sm font-medium">{row.label}</p>
                </div>
                <p className="text-2xl font-bold">{row.value}</p>
                {row.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {row.description}
                  </p>
                )}
                {row.change !== undefined && (
                  <div className="flex items-center gap-1 mt-2">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        row.change > 0
                          ? "text-green-600 dark:text-green-400"
                          : row.change < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground",
                      )}
                    >
                      {row.change > 0 ? "+" : ""}
                      {row.change}%
                    </span>
                    {row.changeLabel && (
                      <span className="text-xs text-muted-foreground">
                        {row.changeLabel}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
