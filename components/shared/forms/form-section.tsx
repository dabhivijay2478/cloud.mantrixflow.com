"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * FormSection
 * @description Grouped form fields container with title and optional description.
 * Provides semantic sectioning for complex forms.
 * @param {FormSectionProps} props - Component properties
 * @param {React.ReactNode} props.children - Form fields
 * @param {string} [props.title] - Section title
 * @param {string} [props.description] - Section description
 * @param {boolean} [props.separator] - Show separator after header (default: false)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} FormSection component
 * @example
 * <FormSection
 *   title="Personal Information"
 *   description="Enter your personal details"
 * >
 *   <FormField name="firstName" />
 *   <FormField name="lastName" />
 * </FormSection>
 */
export interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  separator?: boolean;
  className?: string;
}

export function FormSection({
  children,
  title,
  description,
  separator = false,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <>
          <div className="space-y-1">
            {title && (
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {separator && <Separator />}
        </>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
