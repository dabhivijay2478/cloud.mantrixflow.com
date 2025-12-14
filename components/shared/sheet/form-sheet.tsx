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
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "5xl" | "full";
  className?: string;
}

const maxWidthClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "5xl": "sm:max-w-5xl",
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
          "w-full overflow-y-auto ",
          maxWidthClasses[maxWidth],
          className,
        )}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="p-4">{children}</div>

        {footer && <SheetFooter className="pt-4 mt-auto">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
