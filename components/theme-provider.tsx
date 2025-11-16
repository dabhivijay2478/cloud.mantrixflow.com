"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type * as React from "react";
import { useThemeStore, updateThemeDarkMode } from "@/lib/stores/theme-store";

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const themeStore = useThemeStore();

  // Sync dark mode state with next-themes and apply theme
  useEffect(() => {
    const isDark = resolvedTheme === "dark";
    updateThemeDarkMode(isDark);
  }, [resolvedTheme]);

  // Apply theme on mount - only if customized
  useEffect(() => {
    // Check if theme is customized, if not, clear any custom CSS variables
    // This ensures default theme from globals.css is used
    themeStore.applyCurrentTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeSync>{children}</ThemeSync>
    </NextThemesProvider>
  );
}
