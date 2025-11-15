"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * PageContainer
 * @description Standardized page wrapper with consistent padding and spacing.
 * Provides consistent page layout across the application.
 * @param {PageContainerProps} props - Component properties
 * @param {React.ReactNode} props.children - Page content
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.maxWidth] - Max width class (e.g., "max-w-7xl")
 * @returns {JSX.Element} PageContainer component
 * @example
 * <PageContainer>
 *   <PageHeader title="Dashboard" />
 *   <div>Content</div>
 * </PageContainer>
 */
export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export function PageContainer({
  children,
  className,
  maxWidth = "max-w-7xl",
}: PageContainerProps) {
  return <div className={cn("space-y-6", maxWidth, className)}>{children}</div>;
}
