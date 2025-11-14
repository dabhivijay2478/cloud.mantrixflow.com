"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * CenteredCardLayout
 * @description Centered card layout wrapper for onboarding and auth pages.
 * Provides consistent centered card layout with max-width constraint.
 * @param {CenteredCardLayoutProps} props - Component properties
 * @param {React.ReactNode} props.children - Content to center
 * @param {string} [props.maxWidth] - Max width class (default: "max-w-2xl")
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} CenteredCardLayout component
 * @example
 * <CenteredCardLayout>
 *   <Card>...</Card>
 * </CenteredCardLayout>
 */
export interface CenteredCardLayoutProps {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function CenteredCardLayout({
  children,
  maxWidth = "max-w-2xl",
  className,
}: CenteredCardLayoutProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4", className)}>
      <div className={cn("w-full", maxWidth)}>
        {children}
      </div>
    </div>
  );
}

