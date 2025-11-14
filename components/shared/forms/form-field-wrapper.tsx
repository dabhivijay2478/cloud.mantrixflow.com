"use client";

import * as React from "react";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

/**
 * FormFieldWrapper
 * @description Standardized form field wrapper combining Label + Input/Select + Error + Description.
 * Provides consistent field structure across all forms.
 * @param {FormFieldWrapperProps} props - Component properties
 * @param {React.ReactNode} props.children - Input/Select component
 * @param {string} props.label - Field label
 * @param {string} [props.htmlFor] - Label htmlFor attribute (for accessibility)
 * @param {string | React.ReactNode} [props.error] - Error message or FieldError props
 * @param {string} [props.description] - Field description/help text
 * @param {boolean} [props.required] - Show required indicator
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} FormFieldWrapper component
 * @example
 * <FormFieldWrapper
 *   label="Email"
 *   htmlFor="email"
 *   error={errors.email?.message}
 *   description="We'll never share your email"
 *   required
 * >
 *   <Input id="email" {...register("email")} />
 * </FormFieldWrapper>
 */
export interface FormFieldWrapperProps {
  children: React.ReactNode;
  label: string;
  htmlFor?: string;
  error?: string | React.ReactNode;
  description?: string;
  required?: boolean;
  className?: string;
}

export function FormFieldWrapper({
  children,
  label,
  htmlFor,
  error,
  description,
  required = false,
  className,
}: FormFieldWrapperProps) {
  return (
    <Field className={className}>
      <FieldLabel htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FieldLabel>
      {children}
      {error && (
        <FieldError
          errors={
            typeof error === "string" ? [{ message: error }] : undefined
          }
        >
          {typeof error === "object" ? error : null}
        </FieldError>
      )}
      {description && (
        <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  );
}

