"use client";

import * as React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * Timestamp
 * @description Standardized date/time display component.
 * Formats dates consistently across the application.
 * @param {TimestampProps} props - Component properties
 * @param {Date | string | number} props.date - Date to display
 * @param {"short" | "medium" | "long" | "full" | "relative"} [props.format] - Date format style (default: "short")
 * @param {boolean} [props.showTime] - Show time along with date (default: false)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Timestamp component
 * @example
 * <Timestamp date={new Date()} format="medium" />
 * <Timestamp date={dashboard.createdAt} format="relative" />
 */
export interface TimestampProps {
  date: Date | string | number;
  format?: "short" | "medium" | "long" | "full" | "relative";
  showTime?: boolean;
  className?: string;
}

const formatOptions = {
  short: {
    year: "numeric",
    month: "short",
    day: "numeric",
  } as Intl.DateTimeFormatOptions,
  medium: {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  } as Intl.DateTimeFormatOptions,
  long: {
    year: "numeric",
    month: "long",
    day: "numeric",
  } as Intl.DateTimeFormatOptions,
  full: {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  } as Intl.DateTimeFormatOptions,
};

export function Timestamp({
  date,
  format: formatStyle = "short",
  showTime = false,
  className,
}: TimestampProps) {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  if (!dateObj || isNaN(dateObj.getTime())) {
    return <span className={cn("text-muted-foreground", className)}>-</span>;
  }

  if (formatStyle === "relative") {
    return (
      <span className={cn("text-muted-foreground", className)}>
        {formatDistanceToNow(dateObj, { addSuffix: true })}
      </span>
    );
  }

  const options = formatOptions[formatStyle];
  if (showTime && !options.hour) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  const formatted = format(
    dateObj,
    formatStyle === "short"
      ? "MMM d, yyyy"
      : formatStyle === "medium"
        ? "MMM d, yyyy HH:mm"
        : formatStyle === "long"
          ? "MMMM d, yyyy"
          : "MMMM d, yyyy HH:mm:ss",
  );

  return (
    <span className={cn("text-muted-foreground", className)}>{formatted}</span>
  );
}
