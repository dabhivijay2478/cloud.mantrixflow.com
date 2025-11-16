/**
 * Theme Customization Hook
 * Hook for managing theme customization with next-themes integration
 */

import { useEffect } from "react";
import { useTheme as useNextTheme } from "next-themes";
import { useThemeStore, updateThemeDarkMode } from "@/lib/stores/theme-store";

export function useThemeCustomization() {
  const { theme, resolvedTheme } = useNextTheme();
  const themeStore = useThemeStore();

  // Sync dark mode state
  useEffect(() => {
    const isDark = resolvedTheme === "dark";
    updateThemeDarkMode(isDark);
  }, [resolvedTheme]);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    themeStore.applyCurrentTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeStore.theme, resolvedTheme]);

  return {
    ...themeStore,
    systemTheme: theme,
    resolvedTheme,
  };
}

