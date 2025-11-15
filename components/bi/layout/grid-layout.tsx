"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * GridLayout
 * @description Responsive 12-column grid system for dashboard layouts.
 * Provides flexible grid-based layouts with responsive breakpoints.
 * @param {GridLayoutProps} props - Component properties
 * @param {React.ReactNode} props.children - Child components to layout
 * @param {number} [props.cols] - Number of columns (1-12, default: 12)
 * @param {string} [props.gap] - Gap between grid items (default: "md")
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} GridLayout component
 * @example
 * <GridLayout cols={3} gap="lg">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </GridLayout>
 */

export interface GridLayoutProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const gapClasses = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const colClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  12: "grid-cols-12",
};

export function GridLayout({
  children,
  cols = 3,
  gap = "md",
  className,
}: GridLayoutProps) {
  return (
    <div
      className={cn(
        "grid w-full",
        colClasses[cols],
        gapClasses[gap],
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * GridItem
 * @description Individual grid item with column span control.
 * @param {GridItemProps} props - Component properties
 * @param {React.ReactNode} props.children - Child content
 * @param {number} [props.colSpan] - Number of columns to span (1-12, default: 1)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} GridItem component
 * @example
 * <GridLayout cols={4}>
 *   <GridItem colSpan={2}>Spans 2 columns</GridItem>
 *   <GridItem>Spans 1 column</GridItem>
 *   <GridItem>Spans 1 column</GridItem>
 * </GridLayout>
 */

export interface GridItemProps {
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  className?: string;
}

const spanClasses = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

export function GridItem({ children, colSpan = 1, className }: GridItemProps) {
  return <div className={cn(spanClasses[colSpan], className)}>{children}</div>;
}
