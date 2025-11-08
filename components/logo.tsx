"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Logo({
  className = "",
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-8 w-8 ${className}`}>
        <div className="h-full w-full bg-primary animate-pulse rounded" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <div className={`relative ${className}`}>
      <Image
        src="/next.svg"
        alt="MantrixFlow Logo"
        width={size}
        height={size}
        className="object-contain"
        style={{
          // In dark mode: invert to show primary color (logo appears in primary color)
          // In light mode: show as is (logo appears in background color)
          filter: isDark
            ? "brightness(0) saturate(100%) invert(45%) sepia(87%) saturate(2084%) hue-rotate(145deg) brightness(95%) contrast(83%)"
            : "none",
        }}
        priority
      />
    </div>
  );
}
