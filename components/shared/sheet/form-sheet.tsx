"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  maxWidth?: keyof typeof maxWidthClasses;
  className?: string;
}

const maxWidthClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
  "5xl": "sm:max-w-5xl",
  "6xl": "sm:max-w-6xl",
  "7xl": "sm:max-w-7xl",
  full: "sm:max-w-full",
};

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = "right",
  maxWidth = "2xl",
  className,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "w-full overflow-y-auto flex flex-col",
          maxWidthClasses[maxWidth || "2xl"],
          className,
        )}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>

        {footer && <SheetFooter className="pt-4 mt-auto">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
