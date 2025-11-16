/**
 * Theme Store
 * Zustand store for managing theme state
 */

import { create } from "zustand";
import type { ThemeConfig, ThemeMode } from "@/lib/utils/theme";
import {
  applyTheme,
  clearCustomTheme,
  getDefaultTheme,
  isThemeCustomized,
  loadThemeFromStorage,
  saveThemeToStorage,
} from "@/lib/utils/theme";

interface ThemeStore {
  theme: ThemeConfig;
  isDark: boolean;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  setMode: (mode: ThemeMode) => void;
  setColor: (colorKey: keyof ThemeConfig["colors"], value: string) => void;
  setFont: (fontKey: keyof ThemeConfig["fonts"], value: string) => void;
  setRadius: (radius: number) => void;
  resetTheme: () => void;
  applyCurrentTheme: () => void;
  updateIsDark: (dark: boolean) => void;
}

// Initialize theme from storage or use default
const initializeTheme = (): ThemeConfig => {
  if (typeof window !== "undefined") {
    const storedTheme = loadThemeFromStorage();
    // Only use stored theme if it exists and is customized
    if (storedTheme && isThemeCustomized(storedTheme)) {
      return storedTheme;
    }
    // Clear any invalid custom theme
    if (storedTheme && !isThemeCustomized(storedTheme)) {
      localStorage.removeItem("custom-theme");
    }
  }
  return getDefaultTheme();
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: initializeTheme(),
  isDark: false,

  setTheme: (newTheme) => {
    const updatedTheme = { ...get().theme, ...newTheme };
    set({ theme: updatedTheme });
    if (typeof window !== "undefined") {
      // Only save if customized
      if (isThemeCustomized(updatedTheme)) {
        saveThemeToStorage(updatedTheme);
      } else {
        localStorage.removeItem("custom-theme");
      }
    }
    get().applyCurrentTheme();
  },

  setMode: (mode) => {
    const updatedTheme = { ...get().theme, mode };
    set({ theme: updatedTheme });
    if (typeof window !== "undefined") {
      saveThemeToStorage(updatedTheme);
    }
  },

  setColor: (colorKey, value) => {
    const updatedTheme = {
      ...get().theme,
      colors: {
        ...get().theme.colors,
        [colorKey]: value,
      },
    };
    set({ theme: updatedTheme });
    if (typeof window !== "undefined") {
      if (isThemeCustomized(updatedTheme)) {
        saveThemeToStorage(updatedTheme);
      } else {
        localStorage.removeItem("custom-theme");
      }
    }
    get().applyCurrentTheme();
  },

  setFont: (fontKey, value) => {
    const updatedTheme = {
      ...get().theme,
      fonts: {
        ...get().theme.fonts,
        [fontKey]: value,
      },
    };
    set({ theme: updatedTheme });
    if (typeof window !== "undefined") {
      if (isThemeCustomized(updatedTheme)) {
        saveThemeToStorage(updatedTheme);
      } else {
        localStorage.removeItem("custom-theme");
      }
    }
    get().applyCurrentTheme();
  },

  setRadius: (radius) => {
    const updatedTheme = { ...get().theme, radius };
    set({ theme: updatedTheme });
    if (typeof window !== "undefined") {
      if (isThemeCustomized(updatedTheme)) {
        saveThemeToStorage(updatedTheme);
      } else {
        localStorage.removeItem("custom-theme");
      }
    }
    get().applyCurrentTheme();
  },

  resetTheme: () => {
    const defaultTheme = getDefaultTheme();
    set({ theme: defaultTheme });
    if (typeof window !== "undefined") {
      localStorage.removeItem("custom-theme");
      clearCustomTheme();
    }
  },

  applyCurrentTheme: () => {
    const { theme, isDark } = get();
    if (typeof window !== "undefined") {
      applyTheme(theme, isDark);
    }
  },

  updateIsDark: (dark: boolean) => {
    set({ isDark: dark });
    get().applyCurrentTheme();
  },
}));

// Helper to update isDark from outside
export const updateThemeDarkMode = (isDark: boolean) => {
  useThemeStore.getState().updateIsDark(isDark);
};
