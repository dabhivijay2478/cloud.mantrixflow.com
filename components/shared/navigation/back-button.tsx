"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * BackButton
 * @description Standardized back navigation button component.
 * Provides consistent back navigation across pages.
 * @param {BackButtonProps} props - Component properties
 * @param {string} [props.href] - URL to navigate to (if provided, uses Link)
 * @param {() => void} [props.onClick] - Click handler (if provided, uses button)
 * @param {string} [props.label] - Button label text (default: "Back")
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} BackButton component
 * @example
 * <BackButton href="/workspace" />
 * <BackButton onClick={() => router.back()} />
 */
export interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
}

export function BackButton({
  href,
  onClick,
  label = "Back",
  className,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn("h-8", className)}
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      {label}
    </Button>
  );
}

